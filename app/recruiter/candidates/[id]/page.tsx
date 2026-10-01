"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Bot,
  ExternalLink,
  FolderKanban,
  Github,
  GraduationCap,
  Link2,
  Lock,
  Star,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getCandidateAccess, getCandidateDetail, getShortlists, toggleShortlist } from "@/services/recruiter";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";

type CandidateDetail = NonNullable<ReturnType<typeof getCandidateDetail>>;

export default function CandidateProfilePage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const access = getCandidateAccess(params.id);
      setRestricted(access.exists && !access.accessible);
      const detail = getCandidateDetail(params.id);
      setCandidate(detail);
      if (detail && user) {
        setShortlisted(getShortlists(user.id).some((s) => s.student_id === detail.profile.id));
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [params.id, user]);

  const bestViva = useMemo(
    () => (candidate && candidate.vivas.length ? Math.max(...candidate.vivas.map((v) => v.score)) : null),
    [candidate]
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <EmptyState
        icon={<Lock className="h-5 w-5" />}
        title={restricted ? "Profile is private" : "Candidate not found"}
        description={
          restricted
            ? "This student has restricted recruiter access to their profile, so their evidence is not visible to you."
            : "This candidate profile is not available."
        }
        action={{ label: "Back to search", href: "/recruiter" }}
      />
    );
  }

  const { profile, summary, proofChain, projects, certificates, attempts, vivas } = candidate;

  const handleShortlist = () => {
    if (!user) return;
    const result = toggleShortlist(user.id, profile.id, profile.target_role_id);
    setShortlisted(result.shortlisted);
    toast.success(result.shortlisted ? `${profile.name} shortlisted` : `${profile.name} removed from shortlist`);
  };

  return (
    <div className="space-y-6">
      <Link href="/recruiter" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to candidates
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="flex flex-col gap-6 pt-6 md:flex-row md:items-center">
          <Avatar name={profile.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{profile.name}</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{profile.headline}</p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-primary" />
              {profile.college} · {profile.course} · Class of {profile.graduation_year}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {summary.target_role_title && <Badge>Target: {summary.target_role_title}</Badge>}
              <Badge variant="success">{summary.verified_skill_count} verified skills</Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ScoreRing value={summary.readiness} size={100} label="readiness" />
            <Button variant={shortlisted ? "default" : "outline"} size="sm" onClick={handleShortlist}>
              <Star className={shortlisted ? "h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"} />
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skill evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary" /> Skill Evidence (Proof Chain)
          </CardTitle>
          <CardDescription>
            Every score below is backed by assessments, projects, certificates and AI viva — never a blind badge.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {proofChain.map((proof) => (
            <div key={proof.skill_id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">{proof.skill_name}</p>
                  <Badge variant={proof.verification_status === "verified" ? "success" : proof.verification_status === "pending" ? "warning" : "muted"}>
                    {proof.verification_status}
                  </Badge>
                </div>
                <p className="text-sm font-bold tabular-nums">{proof.verification_score}/100</p>
              </div>
              <Progress
                value={proof.verification_score}
                className="mt-2 h-1.5"
                indicatorClassName={proof.verification_score >= 70 ? "bg-emerald-500" : proof.verification_score >= 40 ? "bg-amber-500" : "bg-rose-500"}
              />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {proof.breakdown.map((b) => (
                  <span key={b.source}>
                    {b.label}: <span className="font-semibold text-foreground">{b.contribution}/{b.max_contribution}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No projects.</p>}
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <Badge variant={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "muted"}>
                    {p.verification_status}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.technologies.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                </div>
                {p.evidence && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold">Evidence:</span> {p.evidence}
                  </p>
                )}
                <div className="mt-2 flex gap-3">
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <Github className="h-3 w-3" /> Code
                    </a>
                  )}
                  {p.live_url && (
                    <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" /> Live demo
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Assessments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Assessment Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attempts.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No assessments taken.</p>}
              {attempts.map((a) => (
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

          {/* Certificates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {certificates.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No certificates.</p>}
              {certificates.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.issuer} · {formatDate(c.date)}</p>
                  </div>
                  <Badge variant={c.verification_status === "verified" ? "success" : c.verification_status === "pending" ? "warning" : "muted"}>
                    {c.verification_status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Viva */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" /> AI Viva Performance
                {bestViva !== null && <Badge variant="success" className="ml-auto">best {bestViva}%</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {vivas.length === 0 && <p className="py-3 text-center text-sm text-muted-foreground">No viva sessions.</p>}
              {vivas.map((v) => (
                <div key={v.id} className="rounded-lg border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{v.topic_name}</p>
                    <Badge variant={v.score >= 75 ? "success" : v.score >= 55 ? "warning" : "destructive"}>
                      {v.score}%
                    </Badge>
                  </div>
                  <p className="text-xs capitalize text-muted-foreground">{v.topic_type} viva · {formatDate(v.completed_at)}</p>
                  {v.strengths[0] && <p className="mt-1.5 line-clamp-2 text-xs text-slate-600">“{v.strengths[0]}”</p>}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
