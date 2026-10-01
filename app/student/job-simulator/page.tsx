"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Gauge, Lightbulb, TrendingUp, Zap } from "lucide-react";
import { useStudentData } from "@/hooks/use-student-data";
import { computeJobSimulation, computeSkillGap } from "@/services/skill-gap";
import { jobRoles } from "@/data/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label, Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { ScoreBarChart } from "@/components/charts";

export default function JobSimulatorPage() {
  const { bundle, loading, error, reload } = useStudentData();
  const [roleId, setRoleId] = useState<string>("");

  useEffect(() => {
    if (bundle?.profile.target_role_id) setRoleId(bundle.profile.target_role_id);
    else if (!roleId) setRoleId(jobRoles[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundle?.profile.target_role_id]);

  const gap = useMemo(() => (bundle && roleId ? computeSkillGap(bundle.profile, roleId) : null), [bundle, roleId]);
  const simulation = useMemo(() => (bundle && roleId ? computeJobSimulation(bundle.profile, roleId) : null), [bundle, roleId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-72" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (error || !bundle) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;
  if (!gap || !simulation) return <ErrorState message="Select a valid target role." onRetry={reload} />;

  const comparisonData = [
    { name: "Current", readiness: simulation.current_readiness },
    { name: "After plan", readiness: simulation.projected_readiness },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Readiness Simulator</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            See how closing each skill gap moves your readiness for a target role.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Label htmlFor="simRole" className="mb-1.5 block text-xs text-muted-foreground">Target role</Label>
          <Select id="simRole" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {jobRoles.map((r) => (
              <option key={r.id} value={r.id}>{r.title}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Current vs projected */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" /> Current Readiness
            </CardTitle>
            <CardDescription>{gap.role_title}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ScoreRing value={simulation.current_readiness} size={130} label="ready now" />
            <div className="mt-4 grid w-full grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-emerald-50 p-2">
                <p className="font-bold text-emerald-600">{gap.required_skills.filter((s) => s.status === "strong").length}</p>
                <p className="text-[11px] text-emerald-700">Strong</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-2">
                <p className="font-bold text-amber-600">{gap.required_skills.filter((s) => s.status === "developing").length}</p>
                <p className="text-[11px] text-amber-700">Developing</p>
              </div>
              <div className="rounded-lg bg-rose-50 p-2">
                <p className="font-bold text-rose-600">{gap.missing_skills.length}</p>
                <p className="text-[11px] text-rose-700">Missing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Simulated Improvement
            </CardTitle>
            <CardDescription>If you complete every recommended action</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ScoreRing value={simulation.projected_readiness} size={130} label="projected" />
            <p className="mt-4 text-sm text-muted-foreground">
              Potential gain:{" "}
              <span className="font-bold text-emerald-600">
                +{simulation.projected_readiness - simulation.current_readiness} points
              </span>
            </p>
            {simulation.projected_readiness >= 70 && (
              <Badge variant="success" className="mt-2">
                Placement-ready threshold reached
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before / After</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreBarChart
              data={comparisonData}
              xKey="name"
              bars={[{ key: "readiness", label: "Readiness %", color: "#6366f1" }]}
              height={240}
            />
          </CardContent>
        </Card>
      </div>

      {/* Skills required vs current */}
      <Card>
        <CardHeader>
          <CardTitle>Required vs Current Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gap.required_skills.map((s) => (
            <div key={s.skill_id} className="rounded-lg border px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{s.skill_name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.current_level} / {s.required_level} required
                </span>
              </div>
              <div className="relative">
                <Progress
                  value={s.current_level}
                  className="h-2"
                  indicatorClassName={s.status === "strong" ? "bg-emerald-500" : s.status === "developing" ? "bg-amber-500" : "bg-rose-500"}
                />
                <div className="absolute top-0 h-2 w-0.5 bg-slate-700" style={{ left: `${s.required_level}%` }} aria-hidden />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended next actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500" /> Recommended Next Actions
          </CardTitle>
          <CardDescription>Ordered by readiness gain — start at the top</CardDescription>
        </CardHeader>
        <CardContent>
          {simulation.actions.length === 0 ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-6 text-center">
              <Zap className="mx-auto mb-2 h-6 w-6 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-800">
                You already meet every requirement for {gap.role_title}. Time to apply!
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {simulation.actions.map((action, i) => (
                <li key={action.skill_name + i} className="flex items-center gap-4 rounded-xl border p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Estimated effort: {action.effort}</p>
                  </div>
                  <Badge variant="success" className="shrink-0">+{action.readiness_gain}%</Badge>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/student/assessments">
              <Button variant="outline" size="sm">Take assessments <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
            <Link href="/student/skill-gap">
              <Button variant="outline" size="sm">Learning resources <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
            <Link href="/student/viva">
              <Button variant="outline" size="sm">Practice AI viva <ArrowRight className="h-3.5 w-3.5" /></Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
