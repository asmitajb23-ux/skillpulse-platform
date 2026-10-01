"use client";

import Link from "next/link";
import { ArrowRight, Clock, Code2, HelpCircle, ListChecks, Play } from "lucide-react";
import { useStudentData } from "@/hooks/use-student-data";
import { listAssessments } from "@/services/assessment";
import { getSkillName } from "@/data/demo";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";

export default function AssessmentsPage() {
  const { bundle, loading, error, reload } = useStudentData();
  const assessments = listAssessments();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44" />
          ))}
        </div>
      </div>
    );
  }
  if (error || !bundle) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const { attempts } = bundle;

  const bestForSkill = (skillId: string) => {
    const skillAttempts = attempts.filter((a) => a.skill_id === skillId);
    return skillAttempts.length ? Math.max(...skillAttempts.map((a) => a.percentage)) : null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skill Assessments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Timed MCQ and problem-solving tests. Assessment results are worth 40% of your Skill
          Verification Score.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => {
          const best = bestForSkill(assessment.skill_id);
          const mcq = assessment.questions.filter((q) => q.type === "mcq").length;
          const coding = assessment.questions.length - mcq;
          return (
            <Card key={assessment.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription className="mt-1">{getSkillName(assessment.skill_id)}</CardDescription>
                  </div>
                  {best !== null && (
                    <Badge variant={best >= 75 ? "success" : best >= 50 ? "warning" : "destructive"}>
                      best {best}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm text-muted-foreground">{assessment.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {assessment.duration_minutes} min
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HelpCircle className="h-3.5 w-3.5" /> {mcq} MCQ
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Code2 className="h-3.5 w-3.5" /> {coding} problem
                  </span>
                </div>
                <div className="mt-5 pt-1">
                  <Link href={`/student/assessments/${assessment.id}`}>
                    <Button className="w-full" size="sm">
                      <Play className="h-3.5 w-3.5" />
                      {best !== null ? "Retake assessment" : "Start assessment"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" /> Attempt History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attempts.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-5 w-5" />}
              title="No attempts yet"
              description="Take your first assessment to start building your Skill Proof Chain."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt) => {
                  const assessment = assessments.find((a) => a.id === attempt.assessment_id);
                  return (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-medium">{assessment?.title ?? attempt.assessment_id}</TableCell>
                      <TableCell className="text-muted-foreground">{getSkillName(attempt.skill_id)}</TableCell>
                      <TableCell>
                        <Badge variant={attempt.percentage >= 75 ? "success" : attempt.percentage >= 50 ? "warning" : "destructive"}>
                          {attempt.score}/{attempt.total} ({attempt.percentage}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(attempt.completed_at)}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/student/assessments/${attempt.assessment_id}/result/${attempt.id}`}>
                          <Button variant="ghost" size="sm">
                            View <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
