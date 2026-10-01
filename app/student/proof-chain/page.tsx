"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  Bot,
  ChevronDown,
  ClipboardCheck,
  FolderKanban,
  Info,
  Link2,
} from "lucide-react";
import { useStudentData } from "@/hooks/use-student-data";
import { cn } from "@/lib/utils";
import type { EvidenceBreakdown } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { HorizontalCountChart } from "@/components/charts";

const SOURCE_META: Record<
  EvidenceBreakdown["source"],
  { icon: typeof Award; label: string; color: string; href: string }
> = {
  assessment: { icon: ClipboardCheck, label: "Assessment", color: "bg-indigo-50 text-indigo-600", href: "/student/assessments" },
  project: { icon: FolderKanban, label: "Projects", color: "bg-blue-50 text-blue-600", href: "/student/portfolio" },
  certificate: { icon: Award, label: "Certificates", color: "bg-amber-50 text-amber-600", href: "/student/certificates" },
  viva: { icon: Bot, label: "AI Viva", color: "bg-violet-50 text-violet-600", href: "/student/viva" },
};

export default function ProofChainPage() {
  const { bundle, loading, error, reload } = useStudentData();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (error || !bundle) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const { proofChain } = bundle;

  if (proofChain.length === 0) {
    return (
      <EmptyState
        icon={<Link2 className="h-5 w-5" />}
        title="No skills to verify yet"
        description="Add skills in your profile, then attach assessments, projects, certificates and viva results to build your proof chain."
        action={{ label: "Go to profile", href: "/student/profile" }}
      />
    );
  }

  const chartData = proofChain.map((p) => ({
    skill: p.skill_name,
    score: p.verification_score,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Skill Proof Chain</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every verification score is built from four evidence sources — and you can always see{" "}
          <span className="font-medium text-foreground">why</span> a skill has its score.
        </p>
      </div>

      <Card className="border-indigo-100 bg-indigo-50/40">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-semibold">How verification is computed:</span> Assessment best
            score (40 pts) + project evidence (25 pts) + verified certificates (15 pts) + best AI
            viva performance (20 pts). A skill is{" "}
            <span className="font-medium text-emerald-700">verified at 70+</span>,{" "}
            <span className="font-medium text-amber-700">pending at 40–69</span>, and{" "}
            <span className="font-medium text-rose-700">unverified below 40</span>.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification Scores by Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <HorizontalCountChart data={chartData} yKey="skill" barKey="score" label="Verification score" height={Math.max(260, proofChain.length * 44)} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {proofChain.map((proof) => {
          const isOpen = expanded === proof.skill_id;
          return (
            <Card key={proof.skill_id}>
              <button
                className="w-full text-left"
                onClick={() => setExpanded(isOpen ? null : proof.skill_id)}
                aria-expanded={isOpen}
              >
                <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border bg-white">
                    <span
                      className={cn(
                        "text-lg font-bold",
                        proof.verification_score >= 70
                          ? "text-emerald-600"
                          : proof.verification_score >= 40
                          ? "text-amber-600"
                          : "text-rose-600"
                      )}
                    >
                      {proof.verification_score}
                    </span>
                    <span className="text-[9px] font-medium text-muted-foreground">/ 100</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold">{proof.skill_name}</p>
                      <Badge
                        variant={
                          proof.verification_status === "verified"
                            ? "success"
                            : proof.verification_status === "pending"
                            ? "warning"
                            : "muted"
                        }
                      >
                        {proof.verification_status}
                      </Badge>
                      <Badge variant="outline">self-level {proof.level}/100</Badge>
                    </div>
                    <Progress
                      value={proof.verification_score}
                      className="mt-2 h-1.5 max-w-md"
                      indicatorClassName={
                        proof.verification_score >= 70
                          ? "bg-emerald-500"
                          : proof.verification_score >= 40
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }
                    />
                  </div>
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")}
                  />
                </CardContent>
              </button>

              {isOpen && (
                <CardContent className="space-y-3 border-t pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Evidence breakdown — why this skill scores {proof.verification_score}/100
                  </p>
                  {proof.breakdown.map((item) => {
                    const meta = SOURCE_META[item.source];
                    const MetaIcon = meta.icon;
                    return (
                      <div key={item.source} className="rounded-xl border p-4">
                        <div className="flex items-start gap-3">
                          <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                            <MetaIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-sm font-semibold tabular-nums">
                                {item.contribution}
                                <span className="text-xs font-normal text-muted-foreground"> / {item.max_contribution} pts</span>
                              </p>
                            </div>
                            <Progress
                              value={(item.contribution / item.max_contribution) * 100}
                              className="mt-2 h-1.5"
                            />
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
                            <Link href={meta.href} className="mt-2 inline-block">
                              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                Improve this evidence <ArrowRightSmall />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ArrowRightSmall() {
  return <span aria-hidden>→</span>;
}
