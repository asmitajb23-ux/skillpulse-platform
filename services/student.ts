import { readStore, writeStore } from "@/lib/storage";
import {
  assessmentAttempts as demoAttempts,
  certificates as demoCerts,
  getStudent,
  projects as demoProjects,
  vivaSessions as demoVivas,
} from "@/data/demo";
import { computeProofChain, overallReadiness } from "@/services/skill-score";
import type {
  AssessmentAttempt,
  Certificate,
  Profile,
  Project,
  SkillProof,
  StudentProfile,
  VivaSession,
} from "@/types";

const profileKey = (id: string) => `profile:${id}`;
const attemptsKey = (id: string) => `attempts:${id}`;
const projectsKey = (id: string) => `projects:${id}`;
const certsKey = (id: string) => `certs:${id}`;
const vivasKey = (id: string) => `vivas:${id}`;

export function getStudentProfile(userId: string, session?: Profile | null): StudentProfile | null {
  const stored = readStore<StudentProfile | null>(profileKey(userId), null);
  if (stored) return stored;
  const demo = getStudent(userId);
  if (demo) return demo;
  if (session && session.role === "student") {
    const fresh: StudentProfile = {
      id: userId,
      email: session.email,
      name: session.name,
      college: "",
      course: "",
      graduation_year: new Date().getFullYear() + 2,
      headline: "",
      skills: [],
      target_role_id: null,
      profile_completion: 20,
    };
    writeStore(profileKey(userId), fresh);
    return fresh;
  }
  return null;
}

export function saveStudentProfile(profile: StudentProfile): void {
  writeStore(profileKey(profile.id), profile);
}

export function getAttempts(studentId: string): AssessmentAttempt[] {
  const local = readStore<AssessmentAttempt[]>(attemptsKey(studentId), []);
  const demo = demoAttempts.filter((a) => a.student_id === studentId);
  return [...local, ...demo].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
}

export function saveAttempt(attempt: AssessmentAttempt): void {
  const local = readStore<AssessmentAttempt[]>(attemptsKey(attempt.student_id), []);
  local.push(attempt);
  writeStore(attemptsKey(attempt.student_id), local);
}

export function getProjects(studentId: string): Project[] {
  const local = readStore<Project[]>(projectsKey(studentId), []);
  const demo = demoProjects.filter((p) => p.student_id === studentId);
  return [...local, ...demo].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function saveProjects(studentId: string, projects: Project[]): void {
  const demoIds = new Set(demoProjects.filter((p) => p.student_id === studentId).map((p) => p.id));
  writeStore(projectsKey(studentId), projects.filter((p) => !demoIds.has(p.id)));
}

export function getCertificates(studentId: string): Certificate[] {
  const local = readStore<Certificate[]>(certsKey(studentId), []);
  const demo = demoCerts.filter((c) => c.student_id === studentId);
  return [...local, ...demo].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveCertificates(studentId: string, certs: Certificate[]): void {
  const demoIds = new Set(demoCerts.filter((c) => c.student_id === studentId).map((c) => c.id));
  writeStore(certsKey(studentId), certs.filter((c) => !demoIds.has(c.id)));
}

export function getVivaSessions(studentId: string): VivaSession[] {
  const local = readStore<VivaSession[]>(vivasKey(studentId), []);
  const demo = demoVivas.filter((v) => v.student_id === studentId);
  return [...local, ...demo].sort(
    (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
  );
}

export function saveVivaSession(session: VivaSession): void {
  const local = readStore<VivaSession[]>(vivasKey(session.student_id), []);
  local.push(session);
  writeStore(vivasKey(session.student_id), local);
}

export interface StudentBundle {
  profile: StudentProfile;
  attempts: AssessmentAttempt[];
  projects: Project[];
  certificates: Certificate[];
  vivas: VivaSession[];
  proofChain: SkillProof[];
  readiness: number;
}

export function getStudentBundle(userId: string, session?: Profile | null): StudentBundle | null {
  const profile = getStudentProfile(userId, session);
  if (!profile) return null;
  const attempts = getAttempts(profile.id);
  const projects = getProjects(profile.id);
  const certificates = getCertificates(profile.id);
  const vivas = getVivaSessions(profile.id);
  return {
    profile,
    attempts,
    projects,
    certificates,
    vivas,
    proofChain: computeProofChain(profile, attempts, projects, certificates, vivas),
    readiness: overallReadiness(profile),
  };
}
