"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Bot,
  FolderKanban,
  GraduationCap,
  Lock,
  Target,
  Trophy,
} from "lucide-react";
import { getStudentBundle } from "@/services/student";
import { canCollegeAccess } from "@/services/privacy";
import { getStudent } from "@/data/demo";
import { computeSkillGap } from "@/services/skill-gap";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { SkillGapRadar } from "@/components/charts";

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [bundle, setBundle] = useState<ReturnType<typeof getStudentBundle>>(null);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const allowed = canCollegeAccess(params.id, "college_admin");
      setRestricted(!allowed);
      setBundle(allowed ? getStudentBundle(params.id, null) : null);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  const student = getStudent(params.id);
  if (!bundle || !student) {
    return (
      <EmptyState
        icon={<Lock className="h-5 w-5" />}
        title={restricted ? "Access not permitted" : "Student not found"}
        description={
          restricted
            ? "This student has not granted your college analytics access, so their individual data is hidden."
            : "This student profile is not available."
        }
        action={{ label: "Back to students", href: "/admin/students" }}
      />
    );
  }

  const gap = computeSkillGap(bundle.profile, bundle.profile.target_role_id ?? "");

  return (
    <div className="space-y-6">
      <Link href="/admin/students" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 md:flex-row md:items-center">
          <Avatar name={bundle.profile.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{bundle.profile.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{bundle.profile.headline || bundle.profile.email}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              {bundle.profile.college} · {bundle.profile.course} · Class of {bundle.profile.graduation_year}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {gap && <Badge>Target: {gap.role_title}</Badge>}
              <Badge variant="secondary">Profile {bundle.profile.profile_completion}%</Badge>
              <Badge variant="success">
                {bundle.proofChain.filter((p) => p.verification_status === "verified").length} verified skills
              </Badge>
            </div>
          </div>
          <ScoreRing value={bundle.readiness} size={110} label="readiness" />
        </CardContent>
      </Card>

      {gap && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Skill Gaps — {gap.role_title}
              </CardTitle>
              <CardDescription>{gap.readiness_percentage}% ready for target role</CardDescription>
            </CardHeader>
            <CardContent>
              <SkillGapRadar
                data={gap.required_skills.map((s) => ({
                  skill: s.skill_name,
                  current: s.current_level,
                  required: s.required_level,
                }))}
              />
              {gap.missing_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Missing:</span>
                  {gap.missing_skills.map((s) => (
                    <Badge key={s} variant="destructive">{s}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skill Proof Chain</CardTitle>
              <CardDescription>Evidence-based verification scores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {bundle.proofChain.map((p) => (
                <div key={p.skill_id}>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.skill_name}</span>
                      <Badge variant={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "muted"}>
                        {p.verification_status}
                      </Badge>
                    </div>
                    <span className="font-semibold tabular-nums">{p.verification_score}/100</span>
                  </div>
                  <Progress
                    value={p.verification_score}
                    className="mt-1.5 h-1.5"
                    indicatorClassName={p.verification_score >= 70 ? "bg-emerald-500" : p.verification_score >= 40 ? "bg-amber-500" : "bg-rose-500"}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Assessment Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bundle.attempts.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No attempts.</p>}
            {bundle.attempts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium capitalize">{a.assessment_id.replace("as-", "")}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.completed_at)}</p>
                </div>
                <Badge variant={a.percentage >= 75 ? "success" : a.percentage >= 50 ? "warning" : "destructive"}>
                  {a.percentage}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {bundle.projects.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No projects.</p>}
            {bundle.projects.map((p) => (
              <div key={p.id} className="rounded-lg border px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <Badge variant={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "muted"}>
                    {p.verification_status}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.technologies.join(" · ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bundle.certificates.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">None.</p>}
              {bundle.certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer}</p>
                  </div>
                  <Badge variant={c.verification_status === "verified" ? "success" : c.verification_status === "pending" ? "warning" : "muted"}>
                    {c.verification_status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> AI Viva Sessions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bundle.vivas.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">None.</p>}
              {bundle.vivas.map((v) => (
                <div key={v.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{v.topic_name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{v.topic_type} · {formatDate(v.completed_at)}</p>
                  </div>
                  <Badge variant={v.score >= 75 ? "success" : v.score >= 55 ? "warning" : "destructive"}>
                    {v.score}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
