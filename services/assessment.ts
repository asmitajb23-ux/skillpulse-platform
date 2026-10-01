import { assessments } from "@/data/demo";
import { uid } from "@/lib/storage";
import { saveAttempt } from "@/services/student";
import type { Assessment, AssessmentAttempt, AssessmentQuestion } from "@/types";

export function listAssessments(): Assessment[] {
  return assessments;
}

export function getAssessment(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id);
}

export function gradeMcq(question: AssessmentQuestion, selectedIndex: number | null): boolean {
  return selectedIndex !== null && selectedIndex === question.correct_option;
}

export function gradeCoding(question: AssessmentQuestion, answer: string): boolean {
  const keywords = question.keywords ?? [];
  if (keywords.length === 0) return answer.trim().length >= 40;
  const normalized = answer.toLowerCase();
  const hits = keywords.filter((k) => normalized.includes(k.toLowerCase())).length;
  return hits >= Math.max(2, Math.ceil(keywords.length * 0.4));
}

export interface SubmittedAnswer {
  question_id: string;
  answer: string;
  correct: boolean;
  earned: number;
}

export function submitAssessment(params: {
  assessment: Assessment;
  studentId: string;
  mcqAnswers: Record<string, number | null>;
  codingAnswers: Record<string, string>;
  timeTakenSeconds: number;
}): AssessmentAttempt {
  const { assessment, studentId, mcqAnswers, codingAnswers, timeTakenSeconds } = params;
  const answers: SubmittedAnswer[] = assessment.questions.map((q) => {
    if (q.type === "mcq") {
      const selected = mcqAnswers[q.id] ?? null;
      return {
        question_id: q.id,
        answer: selected === null ? "(unanswered)" : q.options?.[selected] ?? "",
        correct: gradeMcq(q, selected),
        earned: gradeMcq(q, selected) ? q.points : 0,
      };
    }
    const text = codingAnswers[q.id] ?? "";
    const correct = gradeCoding(q, text);
    return {
      question_id: q.id,
      answer: text,
      correct,
      earned: correct ? q.points : Math.round(q.points * (text.trim().length >= 20 ? 0.3 : 0)),
    };
  });

  const score = answers.reduce((sum, a) => sum + a.earned, 0);
  const total = assessment.questions.reduce((sum, q) => sum + q.points, 0);
  const attempt: AssessmentAttempt = {
    id: uid("att"),
    assessment_id: assessment.id,
    student_id: studentId,
    skill_id: assessment.skill_id,
    score,
    total,
    percentage: Math.round((score / total) * 100),
    time_taken_seconds: timeTakenSeconds,
    completed_at: new Date().toISOString(),
    answers: answers.map(({ question_id, answer, correct }) => ({ question_id, answer, correct })),
  };
  saveAttempt(attempt);
  return attempt;
}
