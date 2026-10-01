"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Eye,
  Globe,
  IdCard,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
  UserRoundSearch,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { roleHomePath } from "@/services/auth";
import {
  cancelDeletionRequest,
  getDeletionRequest,
  getPrivacySettings,
  requestDataDeletion,
  savePrivacySettings,
} from "@/services/privacy";
import { cn, formatDate } from "@/lib/utils";
import type { DataDeletionRequest, PrivacySettings, ProfileVisibility } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/state-views";

function SettingRow({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b py-4 last:border-0 last:pb-0">
      <div className="flex min-w-0 gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="shrink-0 pt-1">{children}</div>
    </div>
  );
}

function VisibilityToggle({
  value,
  onChange,
}: {
  value: ProfileVisibility;
  onChange: (v: ProfileVisibility) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border p-0.5">
      {(["public", "private"] as ProfileVisibility[]).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
            value === option ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {option}
        </button>
      ))}
    </div>
  );
}

export default function PrivacySettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [deletion, setDeletion] = useState<DataDeletionRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setReady(true);
      return;
    }
    setSettings(getPrivacySettings(user.id));
    setDeletion(getDeletionRequest(user.id));
    setReady(true);
  }, [user]);

  const update = useCallback(
    (patch: Partial<PrivacySettings>) => {
      if (!user || !settings) return;
      const next = { ...settings, ...patch };
      setSettings(next);
      savePrivacySettings(user.id, next);
      toast.success("Privacy settings saved");
    },
    [user, settings]
  );

  const handleRequestDeletion = () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const request = requestDataDeletion(user.id, user.email, reason);
      setDeletion(request);
      setDialogOpen(false);
      setReason("");
      toast.success("Deletion request submitted. We'll email you to confirm.");
    } catch {
      toast.error("Could not submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelDeletion = () => {
    if (!user) return;
    cancelDeletionRequest(user.id);
    setDeletion(getDeletionRequest(user.id));
    toast.info("Deletion request cancelled.");
  };

  if (loading || !ready) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  const header = (
    <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
            <Zap className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Skill<span className="text-primary">Pulse</span>
          </span>
        </Link>
        <Link
          href={user ? roleHomePath(user.role) : "/"}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" /> {user ? "Back to dashboard" : "Home"}
        </Link>
      </div>
    </header>
  );

  if (!user || !settings) {
    return (
      <div className="min-h-screen bg-slate-50">
        {header}
        <div className="container max-w-3xl py-12">
          <EmptyState
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Sign in to manage privacy"
            description="Your privacy and data controls are available once you log in to your SkillPulse account."
            action={{ label: "Go to login", href: "/login?next=/privacy-settings" }}
          />
        </div>
      </div>
    );
  }

  const isStudent = user.role === "student";

  return (
    <div className="min-h-screen bg-slate-50">
      {header}
      <main className="container max-w-3xl space-y-6 py-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Privacy Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control what is shared, who can see your profile, and how your data is used. Changes save
            automatically.
          </p>
        </div>

        {/* Visibility & sharing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Visibility &amp; sharing
            </CardTitle>
            <CardDescription>
              Decide how your profile and evidence appear to others.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              icon={<Globe className="h-4 w-4" />}
              title="Profile visibility"
              description="Private hides your profile from recruiter search and disables public sharing."
            >
              <VisibilityToggle
                value={settings.profile_visibility}
                onChange={(v) => update({ profile_visibility: v })}
              />
            </SettingRow>

            {isStudent && (
              <>
                <SettingRow
                  icon={<IdCard className="h-4 w-4" />}
                  title="Skill Passport sharing"
                  description="When on, your public passport link and QR code are active. When off, the passport is visible only to you."
                >
                  <Switch
                    checked={settings.passport_sharing}
                    onCheckedChange={(v) => update({ passport_sharing: v })}
                    aria-label="Skill Passport sharing"
                  />
                </SettingRow>

                <SettingRow
                  icon={<UserRoundSearch className="h-4 w-4" />}
                  title="Allow recruiters to view profile"
                  description="Lets recruiters open your detailed skill evidence. Requires a public profile."
                >
                  <Switch
                    checked={settings.allow_recruiter_access}
                    disabled={settings.profile_visibility === "private"}
                    onCheckedChange={(v) => update({ allow_recruiter_access: v })}
                    aria-label="Allow recruiters to view profile"
                  />
                </SettingRow>

                <SettingRow
                  icon={<Building2 className="h-4 w-4" />}
                  title="Allow college analytics access"
                  description="Lets your college admin include your individual data in department analytics."
                >
                  <Switch
                    checked={settings.allow_college_analytics}
                    onCheckedChange={(v) => update({ allow_college_analytics: v })}
                    aria-label="Allow college analytics access"
                  />
                </SettingRow>

                <SettingRow
                  icon={<Mail className="h-4 w-4" />}
                  title="Show contact email on public passport"
                  description="Off by default. Your email never appears on the public Skill Passport unless you enable this."
                >
                  <Switch
                    checked={settings.show_contact_email}
                    onCheckedChange={(v) => update({ show_contact_email: v })}
                    aria-label="Show contact email on public passport"
                  />
                </SettingRow>
              </>
            )}

            {!isStudent && (
              <p className="pt-4 text-xs text-muted-foreground">
                Passport, recruiter and college-analytics controls apply to student accounts. As a{" "}
                <span className="capitalize">{user.role === "college_admin" ? "college admin" : user.role}</span>,
                profile visibility governs whether your account appears in any directory.
              </p>
            )}
          </CardContent>
        </Card>

        {/* How your data is used */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> How your data is protected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Authentication is handled by Supabase Auth — passwords are never stored by our own code.
              Database access is restricted by Row Level Security and role-based authorization, and
              secrets are kept in environment variables, never in the browser.
            </p>
            <p>
              Read the full details in our{" "}
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/cookies" className="font-medium text-primary hover:underline">
                Cookie Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        {/* Data & deletion */}
        <Card className="border-rose-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <Trash2 className="h-4 w-4" /> Account &amp; data deletion
            </CardTitle>
            <CardDescription>
              Request permanent deletion of your account and associated evidence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deletion && deletion.status === "pending" ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Request pending</Badge>
                  <span className="text-xs text-muted-foreground">
                    Submitted {formatDate(deletion.requested_at)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-amber-800">
                  We received your request for <span className="font-medium">{deletion.email}</span>.
                  You'll get a confirmation email before your data is permanently removed. You can
                  cancel until it is processed.
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={handleCancelDeletion}>
                  Cancel request
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  This will erase your profile, skill evidence, projects, certificates, assessments and
                  viva sessions. Where we must keep aggregate figures for institutional reporting, that
                  data is anonymized. This action cannot be undone.
                </p>
                <Button variant="destructive" onClick={() => setDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" /> Request account &amp; data deletion
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <p className="pb-6 text-center text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{user.email}</span> ·{" "}
          <button onClick={() => router.push(roleHomePath(user.role))} className="text-primary hover:underline">
            Return to dashboard
          </button>
        </p>
      </main>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Request account & data deletion"
        description="Tell us why (optional). You'll confirm via email before anything is removed."
      >
        <div className="space-y-4">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for leaving (optional)"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Keep my account
            </Button>
            <Button variant="destructive" onClick={handleRequestDeletion} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit deletion request"}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
