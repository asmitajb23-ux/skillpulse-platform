"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  FolderKanban,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useStudentData } from "@/hooks/use-student-data";
import { computeSkillGap } from "@/services/skill-gap";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";

export default function StudentDashboardPage() {
  const { bundle, loading, error, reload } = useStudentData();

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-1" />
          <Skeleton className="h-56 lg:col-span-2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (error || !bundle) {
    return <ErrorState message={error ?? "No student data found."} onRetry={reload} />;
  }

  const { profile, attempts, projects, certificates, proofChain, readiness } = bundle;
  const gap = computeSkillGap(profile, profile.target_role_id ?? "");
  const strongSkills = proofChain.filter((p) => p.level >= 70).slice(0, 4);
  const gapSkills = gap
    ? gap.required_skills.filter((s) => s.status !== "strong").sort((a, b) => b.weight - a.weight).slice(0, 4)
    : [];
  const recentAttempts = attempts.slice(0, 4);
  const recommended = gap?.resources.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {profile.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here&apos;s your skill readiness at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/assessments">
            <Button variant="outline" size="sm">Take an assessment</Button>
          </Link>
          <Link href="/student/passport">
            <Button size="sm">View Skill Passport</Button>
          </Link>
        </div>
      </div>

      {/* Top row: readiness + profile + target role */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Overall Skill Readiness</CardTitle>
            <CardDescription>
              {gap ? `Weighted against ${gap.role_title}` : "Average across your skills"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <ScoreRing value={readiness} size={110} label="ready" />
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium">Profile completion</p>
                <Progress value={profile.profile_completion} className="mt-1.5 w-32" />
                <p className="mt-1 text-xs text-muted-foreground">{profile.profile_completion}% complete</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Verified skills</p>
                <p className="font-semibold text-emerald-600">
                  {proofChain.filter((p) => p.verification_status === "verified").length} of {proofChain.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Target Job Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gap ? (
              <>
                <p className="text-lg font-semibold">{gap.role_title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {gap.readiness_percentage}% ready ·{" "}
                  {gap.required_skills.filter((s) => s.status === "strong").length}/
                  {gap.required_skills.length} required skills strong
                </p>
                {gap.missing_skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground">Missing skills</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {gap.missing_skills.map((s) => (
                        <Badge key={s} variant="destructive">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Link href="/student/skill-gap" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  Full gap analysis <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No target role selected yet.</p>
                <Link href="/student/profile">
                  <Button size="sm" className="mt-3">Set target role</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { label: "Assessments", value: attempts.length, href: "/student/assessments" },
              { label: "Projects", value: projects.length, href: "/student/portfolio" },
              { label: "Certificates", value: certificates.length, href: "/student/certificates" },
              { label: "AI Vivas", value: bundle.vivas.length, href: "/student/viva" },
            ].map((stat) => (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-indigo-50/40"
              >
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-0.5 text-xs font-medium text-muted-foreground">{stat.label}</p>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Strong skills & gaps */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Strong Skills
            </CardTitle>
            <CardDescription>Your best-verified skills right now</CardDescription>
          </CardHeader>
          <CardContent>
            {strongSkills.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No strong skills yet — take assessments and add project evidence.
              </p>
            ) : (
              <ul className="space-y-3">
                {strongSkills.map((s) => (
                  <li key={s.skill_id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.skill_name}</span>
                        <span className="text-xs text-muted-foreground">
                          proof {s.verification_score}/100
                        </span>
                      </div>
                      <Progress
                        value={s.level}
                        className="mt-1.5 h-1.5"
                        indicatorClassName="bg-emerald-500"
                      />
                    </div>
                    <Badge variant={s.verification_status === "verified" ? "success" : "warning"}>
                      {s.verification_status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/student/proof-chain" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              See proof chain <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-500" /> Skill Gaps
            </CardTitle>
            <CardDescription>Prioritized against your target role</CardDescription>
          </CardHeader>
          <CardContent>
            {gapSkills.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {gap ? "No gaps — you meet every requirement for your target role!" : "Select a target role in your profile to see gaps."}
              </p>
            ) : (
              <ul className="space-y-3">
                {gapSkills.map((s) => (
                  <li key={s.skill_id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.skill_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {s.current_level} / {s.required_level} needed
                        </span>
                      </div>
                      <Progress value={s.current_level} className="mt-1.5 h-1.5" indicatorClassName="bg-amber-500" />
                    </div>
                    <Badge variant={s.priority === "high" ? "destructive" : s.priority === "medium" ? "warning" : "muted"}>
                      {s.priority}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent assessments, projects, certificates */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {recentAttempts.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No attempts yet.</p>
            ) : (
              <ul className="space-y-3">
                {recentAttempts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{a.assessment_id.replace("as-", "").toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(a.completed_at)}</p>
                    </div>
                    <Badge variant={a.percentage >= 75 ? "success" : a.percentage >= 50 ? "warning" : "destructive"}>
                      {a.percentage}%
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/student/assessments" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All assessments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No projects added yet.</p>
            ) : (
              <ul className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <Badge variant={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "muted"}>
                      {p.verification_status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/student/portfolio" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              Manage portfolio <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            {certificates.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">No certificates added yet.</p>
            ) : (
              <ul className="space-y-3">
                {certificates.slice(0, 4).map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.issuer}</p>
                    </div>
                    <Badge variant={c.verification_status === "verified" ? "success" : c.verification_status === "pending" ? "warning" : "muted"}>
                      {c.verification_status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/student/certificates" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All certificates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recommended learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Recommended Learning
          </CardTitle>
          <CardDescription>Curated to close your most important skill gaps</CardDescription>
        </CardHeader>
        <CardContent>
          {recommended.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recommendations right now — keep building!
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {recommended.map((r) => (
                <a
                  key={r.id}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-indigo-50/40"
                >
                  <Badge variant="secondary" className="mb-2 capitalize">{r.resource_type}</Badge>
                  <p className="text-sm font-medium leading-snug group-hover:text-primary">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.provider}</p>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
