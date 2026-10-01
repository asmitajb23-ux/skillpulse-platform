"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Target,
} from "lucide-react";
import { useStudentData } from "@/hooks/use-student-data";
import { computeSkillGap } from "@/services/skill-gap";
import { jobRoles } from "@/data/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label, Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { SkillGapRadar } from "@/components/charts";

const STATUS_META = {
  strong: { variant: "success" as const, icon: CheckCircle2, label: "Strong" },
  developing: { variant: "warning" as const, icon: AlertCircle, label: "Developing" },
  missing: { variant: "destructive" as const, icon: AlertCircle, label: "Missing" },
};

export default function SkillGapPage() {
  const { bundle, loading, error, reload } = useStudentData();
  const [roleId, setRoleId] = useState<string>("");

  useEffect(() => {
    if (bundle?.profile.target_role_id) setRoleId(bundle.profile.target_role_id);
    else if (!roleId) setRoleId(jobRoles[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle?.profile.target_role_id]);

  const gap = useMemo(
    () => (bundle && roleId ? computeSkillGap(bundle.profile, roleId) : null),
    [bundle, roleId]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }
  if (error || !bundle) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const radarData =
    gap?.required_skills.map((s) => ({
      skill: s.skill_name,
      current: s.current_level,
      required: s.required_level,
    })) ?? [];

  const strongCount = gap?.required_skills.filter((s) => s.status === "strong").length ?? 0;
  const developingCount = gap?.required_skills.filter((s) => s.status === "developing").length ?? 0;
  const missingCount = gap?.missing_skills.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skill Gap Analysis</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare your current skills against the requirements of a target job role.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Label htmlFor="targetRole" className="mb-1.5 block text-xs text-muted-foreground">
            Target job role
          </Label>
          <Select id="targetRole" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </Select>
        </div>
      </div>

      {gap && roleId !== bundle.profile.target_role_id && (
        <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span>You are viewing a role different from your saved target role.</span>
          <Link href="/student/profile">
            <Button variant="outline" size="sm">Update in profile</Button>
          </Link>
        </div>
      )}

      {!gap ? (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="No role selected"
          description="Choose a target role to see your skill gap analysis."
        />
      ) : (
        <>
          {/* Readiness + status summary */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Readiness for {gap.role_title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ScoreRing value={gap.readiness_percentage} size={130} label="ready" />
                <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <p className="text-lg font-bold text-emerald-600">{strongCount}</p>
                    <p className="text-[11px] font-medium text-emerald-700">Strong</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-2.5">
                    <p className="text-lg font-bold text-amber-600">{developingCount}</p>
                    <p className="text-[11px] font-medium text-amber-700">Developing</p>
                  </div>
                  <div className="rounded-lg bg-rose-50 p-2.5">
                    <p className="text-lg font-bold text-rose-600">{missingCount}</p>
                    <p className="text-[11px] font-medium text-rose-700">Missing</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Skill Gap Chart</CardTitle>
                <CardDescription>Your level vs the level required for {gap.role_title}</CardDescription>
              </CardHeader>
              <CardContent>
                <SkillGapRadar data={radarData} />
              </CardContent>
            </Card>
          </div>

          {/* Required skills table */}
          <Card>
            <CardHeader>
              <CardTitle>Required Skills &amp; Priority</CardTitle>
              <CardDescription>Sorted by importance to the role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...gap.required_skills]
                .sort((a, b) => b.weight - a.weight)
                .map((s) => {
                  const meta = STATUS_META[s.status];
                  return (
                    <div key={s.skill_id} className="rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold">{s.skill_name}</p>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                          {s.priority === "high" && <Badge variant="destructive">High priority</Badge>}
                          {s.priority === "medium" && s.status !== "missing" && (
                            <Badge variant="warning">Medium priority</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Importance: {"●".repeat(s.weight)}
                          <span className="text-slate-200">{"●".repeat(5 - s.weight)}</span>
                        </p>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div>
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>Your level: {s.current_level}</span>
                            <span>Required: {s.required_level}</span>
                          </div>
                          <div className="relative">
                            <Progress
                              value={s.current_level}
                              indicatorClassName={
                                s.status === "strong"
                                  ? "bg-emerald-500"
                                  : s.status === "developing"
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }
                            />
                            <div
                              className="absolute top-0 h-2 w-0.5 bg-slate-700"
                              style={{ left: `${s.required_level}%` }}
                              aria-hidden
                            />
                          </div>
                        </div>
                        <Link href={`/student/assessments`}>
                          <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
                            Take assessment <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>

          {/* Missing skills */}
          {gap.missing_skills.length > 0 && (
            <Card className="border-rose-200">
              <CardHeader>
                <CardTitle className="text-rose-700">Missing Skills</CardTitle>
                <CardDescription>
                  These are below 60% of the required level — start here for the biggest readiness gains.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {gap.missing_skills.map((s) => (
                  <Badge key={s} variant="destructive" className="px-3 py-1 text-sm">{s}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recommended learning */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> Recommended Learning Resources
              </CardTitle>
              <CardDescription>Ordered by skill priority for {gap.role_title}</CardDescription>
            </CardHeader>
            <CardContent>
              {gap.resources.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  All required skills are strong — no resources needed right now.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {gap.resources.map((r) => (
                    <a
                      key={r.id}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-indigo-50/40"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize">{r.resource_type}</Badge>
                          <Badge variant="muted" className="capitalize">{r.level}</Badge>
                        </div>
                        <p className="mt-2 text-sm font-medium leading-snug group-hover:text-primary">{r.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{r.provider}</p>
                      </div>
                      <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-5 flex justify-end">
                <Link href="/student/job-simulator">
                  <Button>
                    <Target className="h-4 w-4" /> Simulate job readiness
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
