import {
  getRole,
  getSkill,
  jobRoles,
  studentProfiles,
} from "@/data/demo";
import { readStore, uid, writeStore } from "@/lib/storage";
import { canRecruiterAccess } from "@/services/privacy";
import { getStudentBundle } from "@/services/student";
import { overallReadiness } from "@/services/skill-score";
import type { Shortlist, SkillProof, StudentProfile, VivaSession } from "@/types";

export interface CandidateSummary {
  id: string;
  name: string;
  college: string;
  course: string;
  graduation_year: number;
  headline: string;
  readiness: number;
  target_role_title: string | null;
  top_skills: { name: string; verification_score: number; status: string }[];
  verified_skill_count: number;
  project_count: number;
  verified_project_count: number;
  certificate_count: number;
  avg_viva_score: number | null;
  assessment_count: number;
}

export interface CandidateFilters {
  query?: string;
  skillIds?: string[];
  roleId?: string;
  minReadiness?: number;
}

function summarize(student: StudentProfile): CandidateSummary {
  const bundle = getStudentBundle(student.id, null);
  const readiness = bundle?.readiness ?? overallReadiness(student);
  const proofChain: SkillProof[] = bundle?.proofChain ?? [];
  const vivas: VivaSession[] = bundle?.vivas ?? [];
  const projects = bundle?.projects ?? [];
  return {
    id: student.id,
    name: student.name,
    college: student.college,
    course: student.course,
    graduation_year: student.graduation_year,
    headline: student.headline,
    readiness,
    target_role_title: getRole(student.target_role_id)?.title ?? null,
    top_skills: proofChain.slice(0, 3).map((p) => ({
      name: p.skill_name,
      verification_score: p.verification_score,
      status: p.verification_status,
    })),
    verified_skill_count: proofChain.filter((p) => p.verification_status === "verified").length,
    project_count: projects.length,
    verified_project_count: projects.filter((p) => p.verification_status === "verified").length,
    certificate_count: bundle?.certificates.length ?? 0,
    avg_viva_score: vivas.length
      ? Math.round(vivas.reduce((s, v) => s + v.score, 0) / vivas.length)
      : null,
    assessment_count: bundle?.attempts.length ?? 0,
  };
}

export function searchCandidates(filters: CandidateFilters): CandidateSummary[] {
  const { query = "", skillIds = [], roleId, minReadiness = 0 } = filters;
  const q = query.trim().toLowerCase();

  return studentProfiles
    .filter((student) => canRecruiterAccess(student.id))
    .map(summarize)
    .filter((c) => {
      if (q) {
        const student = studentProfiles.find((s) => s.id === c.id)!;
        const haystack = [
          c.name, c.college, c.course, c.headline, c.target_role_title ?? "",
          ...student.skills.map((s) => getSkill(s.skill_id)?.name ?? ""),
        ].join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (skillIds.length > 0) {
        const student = studentProfiles.find((s) => s.id === c.id)!;
        const studentSkillIds = student.skills.map((s) => s.skill_id);
        if (!skillIds.every((id) => studentSkillIds.includes(id))) return false;
      }
      if (roleId) {
        const student = studentProfiles.find((s) => s.id === c.id)!;
        if (student.target_role_id !== roleId) return false;
      }
      if (c.readiness < minReadiness) return false;
      return true;
    })
    .sort((a, b) => b.readiness - a.readiness);
}

/** Whether a candidate exists and has permitted recruiter access to their profile. */
export function getCandidateAccess(studentId: string): { exists: boolean; accessible: boolean } {
  const exists = studentProfiles.some((s) => s.id === studentId);
  return { exists, accessible: exists && canRecruiterAccess(studentId) };
}

export function getCandidateDetail(studentId: string) {
  const student = studentProfiles.find((s) => s.id === studentId);
  if (!student) return null;
  if (!canRecruiterAccess(student.id)) return null;
  const bundle = getStudentBundle(student.id, null);
  if (!bundle) return null;
  return { ...bundle, summary: summarize(student) };
}

export function getComparisonCandidates(ids: string[]) {
  return ids
    .map((id) => studentProfiles.find((s) => s.id === id))
    .filter((s): s is StudentProfile => Boolean(s) && canRecruiterAccess(s!.id))
    .map((s) => ({
      summary: summarize(s),
      bundle: getStudentBundle(s.id, null),
    }))
    .filter((c) => c.bundle !== null);
}

// ---------------- Shortlists ----------------

const shortlistKey = (recruiterId: string) => `shortlists:${recruiterId}`;

export function getShortlists(recruiterId: string): Shortlist[] {
  return readStore<Shortlist[]>(shortlistKey(recruiterId), [
    {
      id: "sl-demo-1",
      recruiter_id: recruiterId,
      student_id: "s2",
      role_id: "role-fe",
      note: "Outstanding React evidence — design system project verified.",
      created_at: "2026-09-22T10:00:00Z",
    },
  ]);
}

export function toggleShortlist(
  recruiterId: string,
  studentId: string,
  roleId: string | null,
  note?: string
): { shortlisted: boolean; shortlists: Shortlist[] } {
  const current = getShortlists(recruiterId);
  const existing = current.find((s) => s.student_id === studentId);
  let next: Shortlist[];
  if (existing) {
    next = current.filter((s) => s.student_id !== studentId);
  } else {
    next = [
      {
        id: uid("sl"),
        recruiter_id: recruiterId,
        student_id: studentId,
        role_id: roleId,
        note: note ?? null,
        created_at: new Date().toISOString(),
      },
      ...current,
    ];
  }
  writeStore(shortlistKey(recruiterId), next);
  return { shortlisted: !existing, shortlists: next };
}

export function listRoles() {
  return jobRoles;
}
