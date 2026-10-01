"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, Link2, RotateCcw, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAssessment } from "@/services/assessment";
import { getAttempts } from "@/services/student";
import { getSkillName } from "@/data/demo";
import { formatDate } from "@/lib/utils";
import type { AssessmentAttempt } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { ScoreBarChart } from "@/components/charts";

export default function AssessmentResultPage() {
  const params = useParams<{ id: string; attemptId: string }>();
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [allSkillAttempts, setAllSkillAttempts] = useState<AssessmentAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  const assessment = useMemo(() => getAssessment(params.id), [params.id]);

  useEffect(() => {
    if (!user) return;
    const attempts = getAttempts(user.id);
    setAttempt(attempts.find((a) => a.id === params.attemptId) ?? null);
    setAllSkillAttempts(
      attempts
        .filter((a) => a.skill_id === (attempts.find((x) => x.id === params.attemptId)?.skill_id ?? ""))
        .reverse()
    );
    setLoading(false);
  }, [user, params.attemptId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!attempt || !assessment) {
    return (
      <EmptyState
        title="Result not found"
        description="This attempt could not be located."
        action={{ label: "Back to assessments", href: "/student/assessments" }}
      />
    );
  }

  const skillName = getSkillName(attempt.skill_id);
  const trendData = allSkillAttempts.map((a, i) => ({
    name: `Attempt ${i + 1}`,
    score: a.percentage,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/student/assessments" className="hover:underline">Assessments</Link> / {assessment.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Assessment Result</h1>
      </div>

      {/* Score summary */}
      <Card>
        <CardContent className="flex flex-col items-center gap-6 pt-6 sm:flex-row sm:items-center sm:justify-around">
          <ScoreRing value={attempt.percentage} size={130} label="score" />
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-lg font-semibold">{assessment.title}</p>
            <p className="text-sm text-muted-foreground">
              {attempt.score} / {attempt.total} points · {formatDate(attempt.completed_at)} ·{" "}
              {Math.floor(attempt.time_taken_seconds / 60)}m {attempt.time_taken_seconds % 60}s
            </p>
            <Badge variant={attempt.percentage >= 75 ? "success" : attempt.percentage >= 50 ? "warning" : "destructive"}>
              {attempt.percentage >= 75 ? "Strong performance" : attempt.percentage >= 50 ? "Room to improve" : "Needs work"}
            </Badge>
            <div className="flex flex-wrap justify-center gap-2 pt-2 sm:justify-start">
              <Link href={`/student/assessments/${assessment.id}`}>
                <Button variant="outline" size="sm">
                  <RotateCcw className="h-3.5 w-3.5" /> Retake
                </Button>
              </Link>
              <Link href="/student/proof-chain">
                <Button size="sm">
                  <Link2 className="h-3.5 w-3.5" /> See impact on proof chain
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skill-wise performance */}
      <Card>
        <CardHeader>
          <CardTitle>{skillName} — Performance Trend</CardTitle>
          <CardDescription>
            Every attempt you have taken for this skill, oldest first. Your best score counts
            toward verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreBarChart
            data={trendData}
            xKey="name"
            bars={[{ key: "score", label: "Score %", color: "#6366f1" }]}
            height={220}
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Best score</p>
              <p className="text-xl font-bold text-emerald-600">
                {Math.max(...allSkillAttempts.map((a) => a.percentage))}%
              </p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Latest score</p>
              <p className="text-xl font-bold text-primary">{attempt.percentage}%</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-xs text-muted-foreground">Total attempts</p>
              <p className="text-xl font-bold">{allSkillAttempts.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question-wise detail */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Results</CardTitle>
          <CardDescription>Question-wise breakdown with explanations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {assessment.questions.map((q, i) => {
            const answer = attempt.answers.find((a) => a.question_id === q.id);
            const correct = answer?.correct ?? false;
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${correct ? "border-emerald-200 bg-emerald-50/40" : "border-rose-200 bg-rose-50/40"}`}
              >
                <div className="flex items-start gap-3">
                  {correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      Q{i + 1}. {q.prompt}
                    </p>
                    <p className="mt-1.5 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Your answer:</span>{" "}
                      {answer?.answer || "(unanswered)"}
                    </p>
                    {q.type === "mcq" && q.options && q.correct_option !== undefined && !correct && (
                      <p className="mt-1 text-sm text-emerald-700">
                        <span className="font-medium">Correct answer:</span> {q.options[q.correct_option]}
                      </p>
                    )}
                    <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-semibold text-foreground">Explanation:</span> {q.explanation}
                    </p>
                    <div className="mt-2">
                      <Badge variant={correct ? "success" : "destructive"}>
                        {correct ? `+${q.points} pts` : `0 / ${q.points} pts`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What this contributes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assessments account for <span className="font-semibold text-foreground">40%</span> of
            your {skillName} verification score. Your best attempt ({Math.max(...allSkillAttempts.map((a) => a.percentage))}%)
            is used.
          </p>
          <Progress
            value={Math.round((Math.max(...allSkillAttempts.map((a) => a.percentage)) / 100) * 40)}
            className="mt-3"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Assessment contribution: {Math.round((Math.max(...allSkillAttempts.map((a) => a.percentage)) / 100) * 40)}/40 points
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
