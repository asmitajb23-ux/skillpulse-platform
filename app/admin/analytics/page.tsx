"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, GraduationCap, Target, TrendingUp } from "lucide-react";
import {
  getAssessmentPerformance,
  getPlacementReadiness,
  getReadinessDistribution,
  getSkillDistribution,
  getTopSkillGaps,
} from "@/services/admin";
import { assessmentAttempts } from "@/data/demo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";
import {
  CountBarChart,
  HorizontalCountChart,
  ReadinessPie,
  ScoreBarChart,
  TrendLineChart,
} from "@/components/charts";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [tick]);

  const skillDistribution = useMemo(() => (loading ? [] : getSkillDistribution()), [loading]);
  const readinessBuckets = useMemo(() => (loading ? [] : getReadinessDistribution()), [loading]);
  const skillGaps = useMemo(() => (loading ? [] : getTopSkillGaps()), [loading]);
  const assessmentPerf = useMemo(() => (loading ? [] : getAssessmentPerformance()), [loading]);
  const placement = useMemo(() => (loading ? [] : getPlacementReadiness()), [loading]);

  const monthlyTrend = useMemo(() => {
    const byMonth = new Map<string, number[]>();
    for (const a of assessmentAttempts) {
      const d = new Date(a.completed_at);
      const key = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
      const arr = byMonth.get(key) ?? [];
      arr.push(a.percentage);
      byMonth.set(key, arr);
    }
    return [...byMonth.entries()]
      .map(([month, scores]) => ({
        month,
        avg: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
        attempts: scores.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  if (error) return <ErrorState message={error} onRetry={() => { setError(null); setTick((t) => t + 1); }} />;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Department-wide skill intelligence, gap trends and placement readiness.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Skill Distribution
            </CardTitle>
            <CardDescription>Average self-assessed level per skill across all students</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalCountChart
              data={skillDistribution.map((d) => ({ skill: d.skill, level: d.average_level }))}
              yKey="skill"
              barKey="level"
              label="Average level"
              height={Math.max(300, skillDistribution.length * 42)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Readiness Distribution
            </CardTitle>
            <CardDescription>Students grouped by role-readiness band</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadinessPie data={readinessBuckets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-500" /> Skill Gap Trends
            </CardTitle>
            <CardDescription>
              Students below the required level for their target role, weighted by industry demand
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalCountChart
              data={skillGaps.map((g) => ({ skill: g.skill, missing: g.students_missing }))}
              yKey="skill"
              barKey="missing"
              label="Students below level"
              color="#f43f5e"
              height={Math.max(260, skillGaps.length * 42)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Assessment Performance
            </CardTitle>
            <CardDescription>Average score per skill across all attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreBarChart
              data={assessmentPerf.map((a) => ({ skill: a.skill, average: a.average }))}
              xKey="skill"
              bars={[{ key: "average", label: "Average score %", color: "#6366f1" }]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Activity Trend</CardTitle>
            <CardDescription>Monthly average score and attempt volume</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendLineChart
              data={monthlyTrend}
              xKey="month"
              lines={[
                { key: "avg", label: "Avg score %", color: "#6366f1" },
                { key: "attempts", label: "Attempts", color: "#10b981" },
              ]}
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-500" /> Placement Readiness
            </CardTitle>
            <CardDescription>Students targeting each role and how many are 70%+ ready</CardDescription>
          </CardHeader>
          <CardContent>
            <CountBarChart
              data={placement.map((p) => ({ role: p.role, ready: p.ready, total: p.students }))}
              xKey="role"
              barKey="ready"
              label="Placement ready"
              color="#10b981"
              height={280}
            />
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {placement.map((p) => (
                <div key={p.role} className="rounded-lg border p-3 text-center">
                  <p className="text-lg font-bold text-primary">
                    {p.ready}/{p.students}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground">{p.role}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
