"use client";

import { useState } from "react";
import {
  ExternalLink,
  FolderKanban,
  Github,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useStudentData } from "@/hooks/use-student-data";
import { getProjects, saveProjects } from "@/services/student";
import { uid } from "@/lib/storage";
import { projectSchema } from "@/lib/validation";
import { skills as allSkills } from "@/data/demo";
import type { Project } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/state-views";
import { cn } from "@/lib/utils";

interface ProjectFormState {
  title: string;
  description: string;
  technologies: string;
  github_url: string;
  live_url: string;
  evidence: string;
  skills: string[];
}

const emptyForm: ProjectFormState = {
  title: "",
  description: "",
  technologies: "",
  github_url: "",
  live_url: "",
  evidence: "",
  skills: [],
};

export default function PortfolioPage() {
  const { user } = useAuth();
  const { bundle, loading, error, reload } = useStudentData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }
  if (error || !bundle || !user) return <ErrorState message={error ?? "Failed to load."} onRetry={reload} />;

  const projects = bundle.projects;

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(", "),
      github_url: project.github_url ?? "",
      live_url: project.live_url ?? "",
      evidence: project.evidence ?? "",
      skills: project.skills,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const handleSave = () => {
    const parsed = projectSchema.safeParse(form);
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
    if (form.skills.length === 0) {
      setErrors({ skills: "Select at least one skill this project demonstrates" });
      toast.error("Select at least one skill");
      return;
    }
    setSaving(true);
    const current = getProjects(user.id);
    let next: Project[];
    if (editingId) {
      next = current.map((p) =>
        p.id === editingId
          ? {
              ...p,
              title: form.title,
              description: form.description,
              technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
              github_url: form.github_url || null,
              live_url: form.live_url || null,
              evidence: form.evidence || null,
              skills: form.skills,
              verification_status: "pending" as const,
            }
          : p
      );
      toast.success("Project updated — sent for re-verification");
    } else {
      const project: Project = {
        id: uid("proj"),
        student_id: user.id,
        title: form.title,
        description: form.description,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        github_url: form.github_url || null,
        live_url: form.live_url || null,
        evidence: form.evidence || null,
        skills: form.skills,
        verification_status: "pending",
        created_at: new Date().toISOString(),
      };
      next = [project, ...current];
      toast.success("Project added — verification in review");
    }
    saveProjects(user.id, next);
    setSaving(false);
    setDialogOpen(false);
    reload();
  };

  const handleDelete = (id: string) => {
    const next = getProjects(user.id).filter((p) => p.id !== id);
    saveProjects(user.id, next);
    setDeletingId(null);
    toast.success("Project deleted");
    reload();
  };

  const statusVariant = (s: Project["verification_status"]) =>
    s === "verified" ? "success" : s === "pending" ? "warning" : "muted";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Projects are worth up to 25 points of each skill&apos;s verification score.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-5 w-5" />}
          title="No projects yet"
          description="Add your first project to start building evidence for your skills."
          action={{ label: "Add project", onClick: openAdd }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold">{project.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant={statusVariant(project.verification_status) as "success" | "warning" | "muted"}>
                    {project.verification_status}
                  </Badge>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                {project.evidence && (
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">
                    <span className="font-semibold">Evidence:</span> {project.evidence}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.skills.map((sid) => {
                    const skill = allSkills.find((s) => s.id === sid);
                    return skill ? (
                      <Badge key={sid} variant="outline">{skill.name}</Badge>
                    ) : null;
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <Github className="h-3.5 w-3.5" /> Code
                      </Button>
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3.5 w-3.5" /> Live demo
                      </Button>
                    </a>
                  )}
                  <div className="ml-auto flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(project)} aria-label={`Edit ${project.title}`}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingId(project.id)} aria-label={`Delete ${project.title}`} className="hover:bg-rose-50 hover:text-rose-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Edit project" : "Add project"}
        description="Detailed evidence increases the chance of verification."
        className="sm:max-w-xl"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pTitle">Title</Label>
            <Input id="pTitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. TaskFlow — Team Task Manager" />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pDesc">Description</Label>
            <Textarea id="pDesc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does it do? What did you build?" />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pTech">Technologies (comma separated)</Label>
            <Input id="pTech" value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js, PostgreSQL" />
            {errors.technologies && <p className="text-xs text-destructive">{errors.technologies}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pGithub">GitHub URL</Label>
              <Input id="pGithub" type="url" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://github.com/…" />
              {errors.github_url && <p className="text-xs text-destructive">{errors.github_url}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pLive">Live project URL</Label>
              <Input id="pLive" type="url" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} placeholder="https://…" />
              {errors.live_url && <p className="text-xs text-destructive">{errors.live_url}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Skills demonstrated</Label>
            <div className="flex flex-wrap gap-2">
              {allSkills.map((skill) => {
                const selected = form.skills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        skills: selected ? f.skills.filter((s) => s !== skill.id) : [...f.skills, skill.id],
                      }))
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                      selected
                        ? "border-primary bg-primary text-white"
                        : "hover:border-primary/40 hover:bg-indigo-50"
                    )}
                  >
                    {skill.name}
                  </button>
                );
              })}
            </div>
            {errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pEvidence">Project evidence</Label>
            <Textarea id="pEvidence" rows={2} value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} placeholder="Deployment stats, commits, usage, test coverage, user feedback…" />
            {errors.evidence && <p className="text-xs text-destructive">{errors.evidence}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Add project"}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <Dialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        title="Delete this project?"
        description="This removes the project and its evidence from your proof chain. This cannot be undone."
      >
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="destructive" onClick={() => deletingId && handleDelete(deletingId)}>
            <Trash2 className="h-4 w-4" /> Delete project
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
