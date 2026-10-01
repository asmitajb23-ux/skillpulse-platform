"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Bot,
  Download,
  ExternalLink,
  EyeOff,
  FolderKanban,
  GraduationCap,
  IdCard,
  Link2,
  Share2,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { useStudentData } from "@/hooks/use-student-data";
import { getPrivacySettings } from "@/services/privacy";
import { getRole } from "@/data/demo";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";
import { ScoreRing } from "@/components/score-ring";
import { QrCode } from "@/components/qr-code";

export default function PassportPage() {
  const { bundle, loading, error, reload } = useStudentData();
  const passportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[800px]" />
      </div>
    );
  }
  if (error || !bundle) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const { profile, proofChain, projects, certificates, attempts, vivas, readiness } = bundle;
  const targetRole = getRole(profile.target_role_id);
  const publicUrl = `https://skillpulse.app/passport/${profile.id}`;
  const privacy = getPrivacySettings(profile.id);
  const isShared = privacy.passport_sharing && privacy.profile_visibility === "public";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success("Public passport link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  };

  const handleDownload = () => {
    // Print-to-PDF gives a clean, shareable document without extra deps
    window.print();
    toast.info("Choose 'Save as PDF' in the print dialog");
  };

  const verifiedProofs = proofChain.filter((p) => p.verification_status === "verified");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Skill Passport</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your shareable, evidence-backed credential summary.
          </p>
        </div>
        <div className="flex gap-2">
          {isShared ? (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Share2 className="h-4 w-4" /> {copied ? "Copied!" : "Copy public link"}
            </Button>
          ) : (
            <Link href="/privacy-settings">
              <Button variant="outline" size="sm">
                <EyeOff className="h-4 w-4" /> Sharing is off
              </Button>
            </Link>
          )}
          <Button size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      {!isShared && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 print:hidden">
          <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            <span className="font-semibold">Public sharing is off.</span> This passport is visible only
            to you — the public link and QR code are disabled.{" "}
            <Link href="/privacy-settings" className="font-medium underline">
              Turn on sharing in Privacy Settings
            </Link>{" "}
            to make it discoverable.
          </p>
        </div>
      )}

      <div ref={passportRef} className="mx-auto max-w-4xl space-y-6">
        {/* Passport header */}
        <Card className="overflow-hidden border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-widest">Skill Passport</span>
              </div>
              <span className="text-xs font-medium text-indigo-100">SkillPulse Verified</span>
            </div>
          </div>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{profile.headline || profile.course}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-primary" /> {profile.college}
                </span>
                <span>{profile.course} · Class of {profile.graduation_year}</span>
                {privacy.show_contact_email && <span>{profile.email}</span>}
              </div>
              {targetRole && (
                <div className="mt-3">
                  <Badge>Target role: {targetRole.title}</Badge>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-5">
              <ScoreRing value={readiness} size={100} label="readiness" />
              {isShared && <QrCode value={publicUrl} className="h-24 w-24 rounded-lg border p-1" />}
            </div>
          </CardContent>
        </Card>

        {/* Verified skills + proof chain summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-primary" /> Verified Skills &amp; Proof Chain
            </CardTitle>
            <CardDescription>
              Verification = assessment (40) + projects (25) + certificates (15) + AI viva (20)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {proofChain.length === 0 && (
              <p className="py-3 text-center text-sm text-muted-foreground">No skills recorded yet.</p>
            )}
            {proofChain.map((proof) => (
              <div key={proof.skill_id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
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
                  </div>
                  <p className="text-sm font-bold tabular-nums">{proof.verification_score}/100</p>
                </div>
                <Progress value={proof.verification_score} className="mt-2 h-1.5" />
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {proof.breakdown.map((b) => (
                    <div key={b.source} className="rounded-lg bg-slate-50 px-2.5 py-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {b.label}
                      </p>
                      <p className="text-xs font-bold">
                        {b.contribution}/{b.max_contribution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              {verifiedProofs.length} of {proofChain.length} skills fully verified (score ≥ 70).
            </p>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.length === 0 && (
              <p className="py-3 text-center text-sm text-muted-foreground">No projects yet.</p>
            )}
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{p.title}</p>
                  <Badge
                    variant={p.verification_status === "verified" ? "success" : p.verification_status === "pending" ? "warning" : "muted"}
                  >
                    {p.verification_status}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{p.description}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {p.technologies.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                  {p.github_url && (
                    <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="ml-auto">
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        <ExternalLink className="h-3 w-3" /> Code
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certificates + assessments */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {certificates.length === 0 && (
                <p className="py-3 text-center text-sm text-muted-foreground">No certificates yet.</p>
              )}
              {certificates.map((c) => (
                <div key={c.id} className="rounded-xl border p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.issuer} · {formatDate(c.date)}</p>
                    </div>
                    <Badge variant={c.verification_status === "verified" ? "success" : c.verification_status === "pending" ? "warning" : "muted"}>
                      {c.verification_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Assessment Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {attempts.length === 0 && (
                <p className="py-3 text-center text-sm text-muted-foreground">No assessments yet.</p>
              )}
              {attempts.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between rounded-xl border px-3.5 py-2.5">
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
        </div>

        {/* AI Viva results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" /> AI Viva Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {vivas.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">No viva sessions yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {vivas.map((v) => (
                  <div key={v.id} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{v.topic_name}</p>
                      <Badge variant={v.score >= 75 ? "success" : v.score >= 55 ? "warning" : "destructive"}>
                        {v.score}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs capitalize text-muted-foreground">
                      {v.topic_type} viva · {formatDate(v.completed_at)}
                    </p>
                    {v.strengths[0] && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">“{v.strengths[0]}”</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer with QR */}
        {isShared ? (
          <Card className="border-indigo-100 bg-slate-50">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center sm:flex-row sm:text-left">
              <QrCode value={publicUrl} className="h-20 w-20 shrink-0 rounded-lg border bg-white p-1" />
              <div>
                <p className="text-sm font-semibold">Verify this passport</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Scan the QR code or visit{" "}
                  <span className="font-medium text-primary">{publicUrl}</span> to see live,
                  tamper-proof verification of every claim above.
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  Public verification coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed bg-slate-50 print:hidden">
            <CardContent className="flex items-center gap-3 pt-6 text-center sm:text-left">
              <EyeOff className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Public verification link and QR code are hidden while passport sharing is off. Enable
                sharing in Privacy Settings to generate them.
              </p>
            </CardContent>
          </Card>
        )}

        <p className="pb-4 text-center text-xs text-muted-foreground print:pb-0">
          Issued by SkillPulse · Generated {formatDate(new Date())} ·{" "}
          <Link href="/student" className="text-primary hover:underline print:hidden">
            Back to dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
