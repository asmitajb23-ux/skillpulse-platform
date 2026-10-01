"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Code2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { getAssessment, submitAssessment } from "@/services/assessment";
import { getSkillName } from "@/data/demo";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/state-views";

export default function TakeAssessmentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const assessment = useMemo(() => getAssessment(params.id), [params.id]);

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number | null>>({});
  const [codingAnswers, setCodingAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const startRef = useRef<number>(0);

  const handleStart = useCallback(() => {
    if (!assessment) return;
    startRef.current = Date.now();
    setSecondsLeft(assessment.duration_minutes * 60);
    setStarted(true);
  }, [assessment]);

  const doSubmit = useCallback(() => {
    if (!assessment || !user || submitting) return;
    setSubmitting(true);
    try {
      const attempt = submitAssessment({
        assessment,
        studentId: user.id,
        mcqAnswers,
        codingAnswers,
        timeTakenSeconds: Math.round((Date.now() - startRef.current) / 1000),
      });
      toast.success(`Assessment submitted — you scored ${attempt.percentage}%`);
      router.push(`/student/assessments/${assessment.id}/result/${attempt.id}`);
    } catch {
      setSubmitting(false);
      toast.error("Failed to submit assessment. Please try again.");
    }
  }, [assessment, user, submitting, mcqAnswers, codingAnswers, router]);

  // Timer
  useEffect(() => {
    if (!started) return;
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s === null) return s;
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started]);

  // Auto-submit when timer hits zero
  const autoSubmitted = useRef(false);
  useEffect(() => {
    if (started && secondsLeft === 0 && !autoSubmitted.current && !submitting) {
      autoSubmitted.current = true;
      toast.warning("Time is up — submitting your assessment automatically.");
      doSubmit();
    }
  }, [started, secondsLeft, submitting, doSubmit]);

  if (!assessment) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-5 w-5" />}
        title="Assessment not found"
        description="This assessment may have been removed."
        action={{ label: "Back to assessments", href: "/student/assessments" }}
      />
    );
  }

  const question = assessment.questions[currentIndex];
  const answeredCount = assessment.questions.filter((q) =>
    q.type === "mcq"
      ? mcqAnswers[q.id] !== undefined && mcqAnswers[q.id] !== null
      : (codingAnswers[q.id] ?? "").trim().length > 0
  ).length;
  const displaySeconds = secondsLeft ?? 0;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const lowTime = secondsLeft !== null && secondsLeft <= 60;

  const requestSubmit = () => {
    const unanswered = assessment.questions.length - answeredCount;
    if (unanswered > 0) {
      setConfirmOpen(true);
    } else {
      doSubmit();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {!started ? (
        <Card className="mx-auto max-w-lg p-8 text-center">
          <CardContent className="pt-6">
            <Badge variant="secondary" className="mb-3">{getSkillName(assessment.skill_id)}</Badge>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{assessment.description}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border p-3">
                <Clock className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="font-semibold">{assessment.duration_minutes} min</p>
                <p className="text-xs text-muted-foreground">Time limit</p>
              </div>
              <div className="rounded-lg border p-3">
                <HelpCircle className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="font-semibold">{assessment.questions.filter((q) => q.type === "mcq").length}</p>
                <p className="text-xs text-muted-foreground">MCQ</p>
              </div>
              <div className="rounded-lg border p-3">
                <Code2 className="mx-auto mb-1 h-4 w-4 text-primary" />
                <p className="font-semibold">{assessment.questions.filter((q) => q.type === "coding").length}</p>
                <p className="text-xs text-muted-foreground">Problems</p>
              </div>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              The timer starts when you begin and auto-submits at zero. You can navigate freely
              between questions.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/student/assessments">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleStart}>Start assessment</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Header: timer + progress */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-white px-5 py-3 card-shadow">
            <div>
              <h1 className="text-sm font-semibold">{assessment.title}</h1>
              <p className="text-xs text-muted-foreground">
                Question {currentIndex + 1} of {assessment.questions.length} · {answeredCount} answered
              </p>
            </div>
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums",
                lowTime ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-primary"
              )}
            >
              <Clock className="h-4 w-4" />
              {minutes}:{seconds.toString().padStart(2, "0")}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
            {/* Question */}
            <Card>
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant={question.type === "mcq" ? "default" : "secondary"}>
                    {question.type === "mcq" ? "Multiple choice" : "Problem solving"} · {question.points} pts
                  </Badge>
                </div>
                <h2 className="text-base font-semibold leading-relaxed">{question.prompt}</h2>

                {question.type === "mcq" && question.options ? (
                  <div className="space-y-2">
                    {question.options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => setMcqAnswers((prev) => ({ ...prev, [question.id]: i }))}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                          mcqAnswers[question.id] === i
                            ? "border-primary bg-indigo-50/60 ring-1 ring-primary"
                            : "hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                            mcqAnswers[question.id] === i
                              ? "border-primary bg-primary text-white"
                              : "border-slate-300 text-transparent"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <Textarea
                    rows={7}
                    placeholder="Explain your approach, or write code/pseudo-code…"
                    value={codingAnswers[question.id] ?? ""}
                    onChange={(e) =>
                      setCodingAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))
                    }
                  />
                )}

                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((i) => i - 1)}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Previous
                  </Button>
                  {currentIndex < assessment.questions.length - 1 ? (
                    <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
                      Next <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  ) : (
                    <Button size="sm" onClick={requestSubmit} disabled={submitting}>
                      {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Submit assessment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Question navigation */}
            <Card className="h-fit">
              <CardContent className="pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Questions
                </p>
                <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
                  {assessment.questions.map((q, i) => {
                    const answered =
                      q.type === "mcq"
                        ? mcqAnswers[q.id] !== undefined && mcqAnswers[q.id] !== null
                        : (codingAnswers[q.id] ?? "").trim().length > 0;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(i)}
                        aria-label={`Go to question ${i + 1}`}
                        className={cn(
                          "flex h-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                          i === currentIndex
                            ? "border-primary bg-primary text-white"
                            : answered
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border border-emerald-300 bg-emerald-50" /> Answered
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded border" /> Not answered
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-4 w-full" onClick={requestSubmit} disabled={submitting}>
                  Submit
                </Button>
              </CardContent>
            </Card>
          </div>

          <Dialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Submit with unanswered questions?"
            description={`${assessment.questions.length - answeredCount} question(s) are still unanswered. Unanswered questions score zero.`}
          >
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Keep working
              </Button>
              <Button
                onClick={() => {
                  setConfirmOpen(false);
                  doSubmit();
                }}
              >
                Submit anyway
              </Button>
            </div>
          </Dialog>
        </>
      )}
    </div>
  );
}
