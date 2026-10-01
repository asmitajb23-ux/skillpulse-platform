"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Link2,
  Users,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAdminStats,
  getReadinessDistribution,
  getSkillDistribution,
  getTopSkillGaps,
  listStudentRows,
} from "@/services/admin";
import type { AdminStats, ReadinessBucket, SkillDistribution, SkillGapTrend } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";
import { CountBarChart, HorizontalCountChart, ReadinessPie } from "@/components/charts";
import { Avatar } from "@/components/ui/avatar";

interface AdminData {
  stats: AdminStats;
  distribution: SkillDistribution[];
  buckets: ReadinessBucket[];
  gaps: SkillGapTrend[];
  topStudents: ReturnType<typeof listStudentRows>;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    try {
      setData({
        stats: getAdminStats(),
        distribution: getSkillDistribution(),
        buckets: getReadinessDistribution(),
        gaps: getTopSkillGaps(),
        topStudents: listStudentRows().slice(0, 5),
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics.");
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, []);

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const { stats } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">College Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.name} · Skill readiness across your department
          </p>
        </div>
        <Link href="/admin/analytics">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-3.5 w-3.5" /> Full analytics
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Users, label: "Total students", value: stats.total_students, color: "text-indigo-600 bg-indigo-50" },
          { icon: CheckCircle2, label: "Active students", value: stats.active_students, color: "text-emerald-600 bg-emerald-50" },
          { icon: GraduationCap, label: "Average readiness", value: `${stats.average_readiness}%`, color: "text-blue-600 bg-blue-50" },
          { icon: Link2, label: "Verified skills", value: stats.verified_skill_count, color: "text-violet-600 bg-violet-50" },
          { icon: ClipboardCheck, label: "Assessments taken", value: stats.assessments_taken, color: "text-amber-600 bg-amber-50" },
          { icon: GraduationCap, label: "Placement ready (70%+)", value: stats.placement_ready, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
            <CardDescription>Students claiming each skill and average level</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalCountChart
              data={data.distribution.map((d) => ({ skill: d.skill, level: d.average_level, students: d.students }))}
              yKey="skill"
              barKey="level"
              label="Average level"
              height={Math.max(280, data.distribution.length * 40)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Readiness Distribution</CardTitle>
            <CardDescription>How many students fall in each readiness band</CardDescription>
          </CardHeader>
          <CardContent>
            <ReadinessPie data={data.buckets} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Skill Gaps</CardTitle>
            <CardDescription>Skills most often below role-required level, weighted by demand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.gaps.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No significant gaps detected.</p>
            )}
            {data.gaps.slice(0, 5).map((g, i) => (
              <div key={g.skill} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-xs font-bold text-rose-600">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.skill}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.students_missing} student{g.students_missing === 1 ? "" : "s"} below level
                    </span>
                  </div>
                  <Progress
                    value={(g.students_missing / stats.total_students) * 100}
                    className="mt-1.5 h-1.5"
                    indicatorClassName="bg-rose-500"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Ready Students</CardTitle>
            <CardDescription>Top 5 by role readiness</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topStudents.map((s) => (
              <Link
                key={s.id}
                href={`/admin/students/${s.id}`}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-indigo-50/40"
              >
                <Avatar name={s.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.target_role_title ?? "No target role"}</p>
                </div>
                <Badge variant={s.readiness >= 70 ? "success" : s.readiness >= 50 ? "warning" : "destructive"}>
                  {s.readiness}%
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
            <Link href="/admin/students" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                View all students <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Coverage</CardTitle>
          <CardDescription>
            {stats.assessments_taken} total attempts across {stats.active_students} active students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CountBarChart
            data={data.distribution.map((d) => ({ skill: d.skill, students: d.students }))}
            xKey="skill"
            barKey="students"
            label="Students with skill"
            color="#3b82f6"
            height={260}
          />
        </CardContent>
      </Card>
    </div>
  );
}
