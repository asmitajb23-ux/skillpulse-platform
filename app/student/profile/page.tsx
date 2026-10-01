"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useStudentData } from "@/hooks/use-student-data";
import { jobRoles, skills as allSkills } from "@/data/demo";
import { saveStudentProfile } from "@/services/student";
import { studentProfileSchema } from "@/lib/validation";
import type { StudentProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label, Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/state-views";

function computeCompletion(p: StudentProfile): number {
  let score = 0;
  if (p.name.trim()) score += 10;
  if (p.college.trim()) score += 15;
  if (p.course.trim()) score += 15;
  if (p.graduation_year) score += 10;
  if (p.headline.trim()) score += 10;
  if (p.target_role_id) score += 15;
  score += Math.min(25, p.skills.length * 5);
  return Math.min(100, score);
}

export default function StudentProfilePage() {
  const { bundle, loading, error, reload } = useStudentData();
  const [form, setForm] = useState<StudentProfile | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);

  useEffect(() => {
    if (bundle) setForm({ ...bundle.profile, skills: [...bundle.profile.skills] });
  }, [bundle]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }
  if (error || !form) {
    return <ErrorState message={error ?? "Profile not found."} onRetry={reload} />;
  }

  const completion = computeCompletion(form);
  const availableSkills = allSkills.filter(
    (s) => !form.skills.some((fs) => fs.skill_id === s.id)
  );

  const update = (patch: Partial<StudentProfile>) => setForm((f) => (f ? { ...f, ...patch } : f));

  const handleSave = async () => {
    const parsed = studentProfileSchema.safeParse({
      name: form.name,
      college: form.college,
      course: form.course,
      graduation_year: form.graduation_year,
      headline: form.headline,
      target_role_id: form.target_role_id ?? "",
      skills: form.skills,
    });
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
    setErrors({});
    setSaving(true);
    const toSave: StudentProfile = { ...form, profile_completion: completion };
    saveStudentProfile(toSave);
    setForm(toSave);
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved successfully");
      reload();
    }, 400);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your details power gap analysis, verification and recruiter discovery.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => update({ name: e.target.value })} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} disabled />
                  <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College</Label>
                  <Input id="college" placeholder="Your college or university" value={form.college} onChange={(e) => update({ college: e.target.value })} />
                  {errors.college && <p className="text-xs text-destructive">{errors.college}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Input id="course" placeholder="e.g. B.Tech Computer Science" value={form.course} onChange={(e) => update({ course: e.target.value })} />
                  {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradYear">Graduation year</Label>
                  <Input
                    id="gradYear"
                    type="number"
                    min={2020}
                    max={2035}
                    value={form.graduation_year}
                    onChange={(e) => update({ graduation_year: Number(e.target.value) })}
                  />
                  {errors.graduation_year && <p className="text-xs text-destructive">{errors.graduation_year}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Target role</Label>
                  <Select
                    id="role"
                    value={form.target_role_id ?? ""}
                    onChange={(e) => update({ target_role_id: e.target.value || null })}
                  >
                    <option value="">Select a target role…</option>
                    {jobRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </Select>
                  {errors.target_role_id && <p className="text-xs text-destructive">{errors.target_role_id}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Textarea
                  id="headline"
                  rows={2}
                  placeholder="A one-line summary recruiters see, e.g. 'Aspiring full stack developer…'"
                  value={form.headline}
                  onChange={(e) => update({ headline: e.target.value })}
                />
                {errors.headline && <p className="text-xs text-destructive">{errors.headline}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>
                Set a self-assessed level for each skill. Assessments and evidence refine this over time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {form.skills.length === 0 && (
                <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
                  No skills added yet. Add your first skill below.
                </p>
              )}
              {form.skills.map((s) => {
                const skill = allSkills.find((x) => x.id === s.skill_id);
                return (
                  <div key={s.skill_id} className="flex items-center gap-4 rounded-lg border px-4 py-3">
                    <div className="w-36 shrink-0">
                      <p className="text-sm font-medium">{skill?.name ?? s.skill_id}</p>
                      <p className="text-xs text-muted-foreground">{skill?.category}</p>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={s.level}
                      aria-label={`${skill?.name} level`}
                      onChange={(e) =>
                        setForm((f) =>
                          f
                            ? {
                                ...f,
                                skills: f.skills.map((x) =>
                                  x.skill_id === s.skill_id ? { ...x, level: Number(e.target.value) } : x
                                ),
                              }
                            : f
                        )
                      }
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-indigo-600"
                    />
                    <span className="w-10 text-right text-sm font-semibold tabular-nums">{s.level}</span>
                    <button
                      onClick={() => setForm((f) => f ? { ...f, skills: f.skills.filter((x) => x.skill_id !== s.skill_id) } : f)}
                      aria-label={`Remove ${skill?.name}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}

              {skillPickerOpen ? (
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium">Add a skill</p>
                    <button onClick={() => setSkillPickerOpen(false)} aria-label="Close skill picker" className="rounded p-1 text-muted-foreground hover:bg-muted">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {availableSkills.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All available skills are already added.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableSkills.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setForm((f) => f ? { ...f, skills: [...f.skills, { skill_id: s.id, level: 30 }] } : f);
                            setSkillPickerOpen(false);
                            toast.success(`${s.name} added — set your level and save`);
                          }}
                          className="rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-primary hover:bg-indigo-50 hover:text-primary"
                        >
                          <Plus className="mr-1 inline h-3.5 w-3.5" />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setSkillPickerOpen(true)}>
                  <Plus className="h-4 w-4" /> Add skill
                </Button>
              )}
              {errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-primary">{completion}%</span>
                <Progress value={completion} className="flex-1" />
              </div>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  { done: Boolean(form.college.trim()), label: "College added" },
                  { done: Boolean(form.course.trim()), label: "Course added" },
                  { done: Boolean(form.headline.trim()), label: "Headline written" },
                  { done: Boolean(form.target_role_id), label: "Target role selected" },
                  { done: form.skills.length >= 3, label: "At least 3 skills" },
                  { done: form.skills.length >= 5, label: "5+ skills for stronger discovery" },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                        item.done ? "bg-emerald-500" : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      ✓
                    </span>
                    <span className={item.done ? "text-muted-foreground line-through" : ""}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tip</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-muted-foreground">
              Recruiters filter candidates by readiness and verified skills. Completing your
              profile, taking assessments and attaching project evidence dramatically improves
              your chances of being discovered.
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge>Assessments 40%</Badge>
                <Badge>Projects 25%</Badge>
                <Badge>AI Viva 20%</Badge>
                <Badge>Certificates 15%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
