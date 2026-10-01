import {
  getSkill,
  getSkillName,
  jobRoles,
  skills,
  studentProfiles,
} from "@/data/demo";
import { getStudentBundle, type StudentBundle } from "@/services/student";
import { canCollegeAccess } from "@/services/privacy";
import { requiredLevelForWeight } from "@/services/skill-score";
import type {
  AdminStats,
  ReadinessBucket,
  SkillDistribution,
  SkillGapTrend,
} from "@/types";

export interface StudentRow {
  id: string;
  name: string;
  email: string;
  course: string;
  graduation_year: number;
  readiness: number;
  profile_completion: number;
  target_role_title: string | null;
  verified_skills: number;
  total_skills: number;
  assessments: number;
  projects: number;
  active: boolean;
}

function allBundles(): { profile: (typeof studentProfiles)[number]; bundle: StudentBundle }[] {
  return studentProfiles
    .filter((profile) => canCollegeAccess(profile.id, "college_admin"))
    .map((profile) => ({ profile, bundle: getStudentBundle(profile.id, null) }))
    .filter((x): x is { profile: (typeof studentProfiles)[number]; bundle: StudentBundle } => x.bundle !== null);
}

export function listStudentRows(query = ""): StudentRow[] {
  const q = query.trim().toLowerCase();
  return allBundles()
    .map(({ profile, bundle }) => ({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      course: profile.course,
      graduation_year: profile.graduation_year,
      readiness: bundle.readiness,
      profile_completion: profile.profile_completion,
      target_role_title: jobRoles.find((r) => r.id === profile.target_role_id)?.title ?? null,
      verified_skills: bundle.proofChain.filter((p) => p.verification_status === "verified").length,
      total_skills: profile.skills.length,
      assessments: bundle.attempts.length,
      projects: bundle.projects.length,
      active: bundle.attempts.length > 0 || bundle.projects.length > 0,
    }))
    .filter((row) => !q || row.name.toLowerCase().includes(q) || row.email.toLowerCase().includes(q) || (row.target_role_title ?? "").toLowerCase().includes(q))
    .sort((a, b) => b.readiness - a.readiness);
}

export function getAdminStats(): AdminStats {
  const bundles = allBundles();
  const readinessValues = bundles.map((b) => b.bundle.readiness);
  const avg = readinessValues.length
    ? Math.round(readinessValues.reduce((s, r) => s + r, 0) / readinessValues.length)
    : 0;
  return {
    total_students: studentProfiles.length,
    active_students: bundles.filter((b) => b.bundle.attempts.length > 0 || b.bundle.vivas.length > 0).length,
    average_readiness: avg,
    verified_skill_count: bundles.reduce(
      (s, b) => s + b.bundle.proofChain.filter((p) => p.verification_status === "verified").length,
      0
    ),
    assessments_taken: bundles.reduce((s, b) => s + b.bundle.attempts.length, 0),
    placement_ready: readinessValues.filter((r) => r >= 70).length,
  };
}

export function getSkillDistribution(): SkillDistribution[] {
  const bundles = allBundles();
  return skills
    .map((skill) => {
      const holders = bundles
        .map((b) => b.profile.skills.find((s) => s.skill_id === skill.id)?.level)
        .filter((l): l is number => typeof l === "number");
      return {
        skill: skill.name,
        students: holders.length,
        average_level: holders.length
          ? Math.round(holders.reduce((s, l) => s + l, 0) / holders.length)
          : 0,
      };
    })
    .filter((d) => d.students > 0)
    .sort((a, b) => b.students - a.students);
}

export function getReadinessDistribution(): ReadinessBucket[] {
  const buckets: ReadinessBucket[] = [
    { range: "0-39%", count: 0 },
    { range: "40-59%", count: 0 },
    { range: "60-79%", count: 0 },
    { range: "80-100%", count: 0 },
  ];
  for (const { bundle } of allBundles()) {
    const r = bundle.readiness;
    if (r < 40) buckets[0].count++;
    else if (r < 60) buckets[1].count++;
    else if (r < 80) buckets[2].count++;
    else buckets[3].count++;
  }
  return buckets;
}

export function getTopSkillGaps(): SkillGapTrend[] {
  const bundles = allBundles();
  const gaps = new Map<string, { missing: number; demand: number }>();
  for (const { profile } of bundles) {
    const role = jobRoles.find((r) => r.id === profile.target_role_id);
    if (!role) continue;
    for (const req of role.required_skills) {
      const required = requiredLevelForWeight(req.weight);
      const current = profile.skills.find((s) => s.skill_id === req.skill_id)?.level ?? 0;
      const entry = gaps.get(req.skill_id) ?? { missing: 0, demand: 0 };
      entry.demand += req.weight;
      if (current < required) entry.missing++;
      gaps.set(req.skill_id, entry);
    }
  }
  return [...gaps.entries()]
    .filter(([, v]) => v.missing > 0)
    .map(([skillId, v]) => ({
      skill: getSkillName(skillId),
      students_missing: v.missing,
      demand_weight: v.demand,
    }))
    .sort((a, b) => b.students_missing * b.demand_weight - a.students_missing * a.demand_weight);
}

export function getAssessmentPerformance(): { skill: string; average: number; attempts: number }[] {
  const bundles = allBundles();
  const bySkill = new Map<string, number[]>();
  for (const { bundle } of bundles) {
    for (const attempt of bundle.attempts) {
      const arr = bySkill.get(attempt.skill_id) ?? [];
      arr.push(attempt.percentage);
      bySkill.set(attempt.skill_id, arr);
    }
  }
  return [...bySkill.entries()]
    .map(([skillId, scores]) => ({
      skill: getSkill(skillId)?.name ?? skillId,
      average: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
      attempts: scores.length,
    }))
    .sort((a, b) => b.average - a.average);
}

export function getPlacementReadiness(): { role: string; students: number; ready: number }[] {
  return jobRoles.map((role) => {
    const students = allBundles().filter(({ profile }) => profile.target_role_id === role.id);
    return {
      role: role.title,
      students: students.length,
      ready: students.filter(({ bundle }) => bundle.readiness >= 70).length,
    };
  }).filter((r) => r.students > 0);
}
