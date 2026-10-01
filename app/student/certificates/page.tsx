"use client";

import { useState } from "react";
import { Award, ExternalLink, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useStudentData } from "@/hooks/use-student-data";
import { getCertificates, saveCertificates } from "@/services/student";
import { uid } from "@/lib/storage";
import { certificateSchema } from "@/lib/validation";
import { skills as allSkills } from "@/data/demo";
import type { Certificate } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { formatDate } from "@/lib/utils";

interface CertFormState {
  name: string;
  issuer: string;
  date: string;
  credential_url: string;
  skill_id: string;
}

const emptyForm: CertFormState = { name: "", issuer: "", date: "", credential_url: "", skill_id: "" };

export default function CertificatesPage() {
  const { user } = useAuth();
  const { bundle, loading, error, reload } = useStudentData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CertFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72" />
      </div>
    );
  }
  if (error || !bundle || !user) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const certificates = bundle.certificates;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setForm({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      credential_url: cert.credential_url ?? "",
      skill_id: cert.skill_id ?? "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const parsed = certificateSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setSaving(true);
    const current = getCertificates(user.id);
    let next: Certificate[];
    if (editingId) {
      next = current.map((c) =>
        c.id === editingId
          ? {
              ...c,
              name: form.name,
              issuer: form.issuer,
              date: form.date,
              credential_url: form.credential_url || null,
              skill_id: form.skill_id || null,
              verification_status: c.credential_url === (form.credential_url || null) ? c.verification_status : "pending",
            }
          : c
      );
      toast.success("Certificate updated");
    } else {
      next = [
        {
          id: uid("cert"),
          student_id: user.id,
          name: form.name,
          issuer: form.issuer,
          date: form.date,
          credential_url: form.credential_url || null,
          skill_id: form.skill_id || null,
          verification_status: form.credential_url ? "pending" : "unverified",
        },
        ...current,
      ];
      toast.success(
        form.credential_url
          ? "Certificate added — verification pending via credential URL"
          : "Certificate added. Add a credential URL to start verification."
      );
    }
    saveCertificates(user.id, next);
    setSaving(false);
    setDialogOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    const next = getCertificates(user.id).filter((c) => c.id !== id);
    saveCertificates(user.id, next);
    setDeletingId(null);
    toast.success("Certificate removed");
    reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified credentials are worth up to 15 points of a skill&apos;s verification score.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add certificate
        </Button>
      </div>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-5 w-5" />}
          title="No certificates yet"
          description="Add certificates you have earned and link credential URLs for verification."
          action={{ label: "Add certificate", onClick: openAdd }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => {
            const skill = allSkills.find((s) => s.id === cert.skill_id);
            return (
              <Card key={cert.id}>
                <CardContent className="flex items-start gap-4 pt-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Award className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{cert.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {cert.issuer} · {formatDate(cert.date)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          cert.verification_status === "verified"
                            ? "success"
                            : cert.verification_status === "pending"
                            ? "warning"
                            : "muted"
                        }
                      >
                        {cert.verification_status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {skill && <Badge variant="outline">{skill.name}</Badge>}
                      {cert.credential_url && (
                        <a href={cert.credential_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            <ExternalLink className="h-3 w-3" /> View credential
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end gap-1 border-t pt-3">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(cert)} aria-label={`Edit ${cert.name}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeletingId(cert.id)} aria-label={`Delete ${cert.name}`} className="hover:bg-rose-50 hover:text-rose-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit certificate" : "Add certificate"}
        description="Certificates with a verifiable credential URL are processed faster."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cName">Certificate name</Label>
            <Input id="cName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Meta Front-End Developer Certificate" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cIssuer">Issuer</Label>
              <Input id="cIssuer" value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Coursera · Meta" />
              {errors.issuer && <p className="text-xs text-destructive">{errors.issuer}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cDate">Date issued</Label>
              <Input id="cDate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cUrl">Credential URL</Label>
            <Input id="cUrl" type="url" value={form.credential_url} onChange={(e) => setForm({ ...form, credential_url: e.target.value })} placeholder="https://…" />
            {errors.credential_url && <p className="text-xs text-destructive">{errors.credential_url}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cSkill">Linked skill</Label>
            <Select id="cSkill" value={form.skill_id} onChange={(e) => setForm({ ...form, skill_id: e.target.value })}>
              <option value="">No specific skill</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Add certificate"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Remove this certificate?"
        description="It will no longer contribute to your verification scores."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deletingId && handleDelete(deletingId)}>
            <Trash2 className="h-4 w-4" /> Remove
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
