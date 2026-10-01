import type {
  AssessmentAttempt,
  Certificate,
  EvidenceBreakdown,
  JobRole,
  Project,
  SkillProof,
  StudentProfile,
  VerificationStatus,
  VivaSession,
} from "@/types";
import { getSkillName, jobRoles } from "@/data/demo";

// Evidence weights for the Skill Verification Score (must total 100)
const WEIGHTS = { assessment: 40, project: 25, certificate: 15, viva: 20 };

function statusForScore(score: number): VerificationStatus {
  if (score >= 70) return "verified";
  if (score >= 40) return "pending";
  return "unverified";
}

export function computeSkillProof(
  skillId: string,
  student: StudentProfile,
  attempts: AssessmentAttempt[],
  projects: Project[],
  certificates: Certificate[],
  vivas: VivaSession[]
): SkillProof {
  const breakdown: EvidenceBreakdown[] = [];
  const skillLevel = student.skills.find((s) => s.skill_id === skillId)?.level ?? 0;

  // 1. Assessment evidence (max 40)
  const skillAttempts = attempts.filter((a) => a.skill_id === skillId);
  const best = skillAttempts.length
    ? Math.max(...skillAttempts.map((a) => a.percentage))
    : 0;
  const assessmentContribution = Math.round((best / 100) * WEIGHTS.assessment);
  breakdown.push({
    source: "assessment",
    label: "Assessment score",
    detail: skillAttempts.length
      ? `Best of ${skillAttempts.length} attempt${skillAttempts.length > 1 ? "s" : ""}: ${best}%`
      : "No assessment taken for this skill yet",
    contribution: assessmentContribution,
    max_contribution: WEIGHTS.assessment,
  });

  // 2. Project evidence (max 25)
  const skillProjects = projects.filter((p) => p.skills.includes(skillId));
  const verifiedProjects = skillProjects.filter((p) => p.verification_status === "verified");
  const pendingProjects = skillProjects.filter((p) => p.verification_status === "pending");
  const projectContribution = Math.min(
    WEIGHTS.project,
    verifiedProjects.length * 15 + pendingProjects.length * 7
  );
  breakdown.push({
    source: "project",
    label: "Project evidence",
    detail: skillProjects.length
      ? `${verifiedProjects.length} verified · ${pendingProjects.length} in review — ${skillProjects
          .map((p) => p.title)
          .join(", ")}`
      : "No portfolio projects demonstrate this skill yet",
    contribution: projectContribution,
    max_contribution: WEIGHTS.project,
  });

  // 3. Certificate evidence (max 15)
  const skillCerts = certificates.filter((c) => c.skill_id === skillId);
  const verifiedCerts = skillCerts.filter((c) => c.verification_status === "verified");
  const certContribution = Math.min(
    WEIGHTS.certificate,
    verifiedCerts.length * 15 + (skillCerts.length - verifiedCerts.length) * 7
  );
  breakdown.push({
    source: "certificate",
    label: "Certificates",
    detail: skillCerts.length
      ? `${verifiedCerts.length} verified credential${verifiedCerts.length === 1 ? "" : "s"}: ${skillCerts
          .map((c) => `${c.name} (${c.issuer})`)
          .join(", ")}`
      : "No certificates linked to this skill",
    contribution: certContribution,
    max_contribution: WEIGHTS.certificate,
  });

  // 4. AI Viva evidence (max 20)
  const relevantVivas = vivas.filter(
    (v) =>
      v.topic_id === skillId ||
      (v.topic_type === "project" && skillProjects.some((p) => p.id === v.topic_id))
  );
  const bestViva = relevantVivas.length ? Math.max(...relevantVivas.map((v) => v.score)) : 0;
  const vivaContribution = Math.round((bestViva / 100) * WEIGHTS.viva);
  breakdown.push({
    source: "viva",
    label: "AI Viva performance",
    detail: relevantVivas.length
      ? `Best viva score ${bestViva}% across ${relevantVivas.length} session${relevantVivas.length > 1 ? "s" : ""} (${relevantVivas
          .map((v) => v.topic_name)
          .join(", ")})`
      : "No AI viva attempted for this skill or its projects",
    contribution: vivaContribution,
    max_contribution: WEIGHTS.viva,
  });

  const verificationScore = breakdown.reduce((sum, b) => sum + b.contribution, 0);

  return {
    skill_id: skillId,
    skill_name: getSkillName(skillId),
    level: skillLevel,
    verification_score: verificationScore,
    verification_status: statusForScore(verificationScore),
    breakdown,
  };
}

export function computeProofChain(
  student: StudentProfile,
  attempts: AssessmentAttempt[],
  projects: Project[],
  certificates: Certificate[],
  vivas: VivaSession[]
): SkillProof[] {
  return student.skills
    .map((s) => computeSkillProof(s.skill_id, student, attempts, projects, certificates, vivas))
    .sort((a, b) => b.verification_score - a.verification_score);
}

export function requiredLevelForWeight(weight: number): number {
  return Math.min(85, 45 + weight * 8);
}

export function computeRoleReadiness(student: StudentProfile, role: JobRole): number {
  let earned = 0;
  let total = 0;
  for (const req of role.required_skills) {
    const current = student.skills.find((s) => s.skill_id === req.skill_id)?.level ?? 0;
    const required = requiredLevelForWeight(req.weight);
    earned += Math.min(current, required) * req.weight;
    total += required * req.weight;
  }
  return total === 0 ? 0 : Math.round((earned / total) * 100);
}

export function overallReadiness(student: StudentProfile): number {
  const role = jobRoles.find((r) => r.id === student.target_role_id);
  if (role) return computeRoleReadiness(student, role);
  if (student.skills.length === 0) return 0;
  return Math.round(
    student.skills.reduce((sum, s) => sum + s.level, 0) / student.skills.length
  );
}
