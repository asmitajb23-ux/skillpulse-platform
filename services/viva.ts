// ============================================================
// AI Viva service — mock implementation.
// The AI layer is fully isolated behind these functions:
//   generateVivaQuestions / evaluateVivaAnswer / completeViva
// Swap the internals for a real LLM API call later without
// touching any UI code.
// ============================================================

import { uid } from "@/lib/storage";
import { saveVivaSession } from "@/services/student";
import type { VivaQuestion, VivaSession } from "@/types";

const TECHNICAL_TERMS = [
  "api", "state", "component", "database", "query", "async", "cache", "render",
  "auth", "token", "test", "deploy", "endpoint", "schema", "index", "hook",
  "performance", "scal", "security", "error", "optimi", "request", "response",
  "architecture", "trade-off", "latency", "pipeline", "algorithm", "data structure",
];

function projectQuestions(projectName: string): VivaQuestion[] {
  return [
    { question: `Walk me through the architecture of "${projectName}". How do the major pieces fit together?` },
    { question: `What was the hardest technical challenge you faced in "${projectName}" and how did you solve it?` },
    { question: `If you had to scale "${projectName}" to 10x more users, what would you change first and why?` },
    { question: `How did you test and validate that "${projectName}" works correctly? What would you improve about your testing?` },
  ];
}

function skillQuestions(skillName: string): VivaQuestion[] {
  return [
    { question: `In your own words, what is ${skillName} and what problem does it solve?` },
    { question: `Describe a real situation where you applied ${skillName}. What was the outcome?` },
    { question: `What are the most common mistakes people make with ${skillName}, and how do you avoid them?` },
    { question: `Compare ${skillName} with a popular alternative. When would you choose each?` },
  ];
}

export function generateVivaQuestions(
  topicType: "project" | "skill",
  topicName: string
): VivaQuestion[] {
  // Mock AI: deterministic, topic-aware question generation.
  return topicType === "project" ? projectQuestions(topicName) : skillQuestions(topicName);
}

export interface AnswerEvaluation {
  score: number;
  evaluation: string;
  feedback: string;
}

export function evaluateVivaAnswer(question: string, answer: string): AnswerEvaluation {
  // Mock AI evaluation: scores answer depth, specificity and technical grounding.
  const normalized = answer.toLowerCase();
  const words = answer.trim().split(/\s+/).filter(Boolean);
  const termHits = TECHNICAL_TERMS.filter((t) => normalized.includes(t));

  let score = 30; // base for attempting
  if (words.length >= 40) score += 15;
  if (words.length >= 90) score += 10;
  if (words.length >= 160) score += 5;
  score += Math.min(25, termHits.length * 6);
  if (/because|so that|this means|which leads|therefore/.test(normalized)) score += 8; // reasoning
  if (/for example|e\.g\.|instance|when i|in my project/.test(normalized)) score += 7; // specificity
  score = Math.min(96, score);

  const evaluation =
    score >= 80
      ? "Strong, specific answer with clear technical reasoning and real examples."
      : score >= 60
      ? "Solid answer that covers the core idea, with room for more depth and examples."
      : score >= 45
      ? "Partial answer — touches the topic but lacks specifics, structure or technical detail."
      : "Weak answer — too brief or vague to demonstrate real understanding.";

  const feedback =
    score >= 80
      ? "Excellent. Try mentioning trade-offs and alternatives to demonstrate expert-level thinking."
      : score >= 60
      ? `Good coverage${termHits.length ? ` of concepts like ${termHits.slice(0, 3).join(", ")}` : ""}. Add a concrete example or metric to make it stronger.`
      : "Structure answers as: concept → why it matters → a specific example from your work → outcome.";

  return { score, evaluation, feedback };
}

export function completeViva(params: {
  studentId: string;
  topicType: "project" | "skill";
  topicId: string;
  topicName: string;
  questions: VivaQuestion[];
  answers: string[];
}): VivaSession {
  const { studentId, topicType, topicId, topicName, questions, answers } = params;

  const evaluated = questions.map((q, i) => {
    const result = evaluateVivaAnswer(q.question, answers[i] ?? "");
    return { ...q, ...result };
  });

  const score = Math.round(evaluated.reduce((s, q) => s + (q.score ?? 0), 0) / evaluated.length);

  const strengths: string[] = [];
  const improvements: string[] = [];
  evaluated.forEach((q, i) => {
    if ((q.score ?? 0) >= 75) {
      strengths.push(`Q${i + 1}: ${q.evaluation}`);
    } else if ((q.score ?? 0) < 60) {
      improvements.push(`Q${i + 1}: ${q.feedback}`);
    }
  });
  if (strengths.length === 0) strengths.push("Completed all viva questions — consistency is a starting strength.");
  if (improvements.length === 0) improvements.push("Push answers further with trade-off analysis and quantified outcomes.");

  const session: VivaSession = {
    id: uid("viva"),
    student_id: studentId,
    topic_type: topicType,
    topic_id: topicId,
    topic_name: topicName,
    questions: evaluated,
    answers,
    score,
    strengths: strengths.slice(0, 4),
    improvements: improvements.slice(0, 4),
    completed_at: new Date().toISOString(),
  };
  saveVivaSession(session);
  return session;
}
