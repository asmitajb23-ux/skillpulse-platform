import { getRole, getSkillName, learningResources } from "@/data/demo";
import { computeRoleReadiness, requiredLevelForWeight } from "@/services/skill-score";
import type { JobReadinessSimulation, LearningResource, SkillGapResult, StudentProfile } from "@/types";

export function computeSkillGap(student: StudentProfile, roleId: string): SkillGapResult | null {
  const role = getRole(roleId);
  if (!role) return null;

  const requiredSkills = role.required_skills.map((req) => {
    const current = student.skills.find((s) => s.skill_id === req.skill_id)?.level ?? 0;
    const required = requiredLevelForWeight(req.weight);
    let status: "strong" | "developing" | "missing";
    if (current >= required) status = "strong";
    else if (current >= required * 0.6) status = "developing";
    else status = "missing";

    let priority: "high" | "medium" | "low";
    if (status === "missing" && req.weight >= 4) priority = "high";
    else if (status === "missing" || (status === "developing" && req.weight >= 4)) priority = "medium";
    else priority = "low";

    return {
      skill_id: req.skill_id,
      skill_name: getSkillName(req.skill_id),
      weight: req.weight,
      current_level: current,
      required_level: required,
      status,
      priority,
    };
  });

  const missing = requiredSkills.filter((s) => s.status === "missing").map((s) => s.skill_name);

  const gapSkillIds = requiredSkills
    .filter((s) => s.status !== "strong")
    .sort((a, b) => b.weight - a.weight)
    .map((s) => s.skill_id);

  const resources: LearningResource[] = learningResources
    .filter((r) => gapSkillIds.includes(r.skill_id))
    .sort((a, b) => gapSkillIds.indexOf(a.skill_id) - gapSkillIds.indexOf(b.skill_id));

  return {
    role_id: role.id,
    role_title: role.title,
    readiness_percentage: computeRoleReadiness(student, role),
    required_skills: requiredSkills,
    missing_skills: missing,
    resources,
  };
}

export function computeJobSimulation(
  student: StudentProfile,
  roleId: string
): JobReadinessSimulation | null {
  const role = getRole(roleId);
  if (!role) return null;

  const current = computeRoleReadiness(student, role);

  const actions = role.required_skills
    .map((req) => {
      const level = student.skills.find((s) => s.skill_id === req.skill_id)?.level ?? 0;
      const required = requiredLevelForWeight(req.weight);
      if (level >= required) return null;
      const totalWeight = role.required_skills.reduce((s, r) => s + r.weight * requiredLevelForWeight(r.weight), 0);
      const gain = Math.round(((required - level) * req.weight) / (totalWeight / 100));
      return {
        label:
          level === 0
            ? `Learn ${getSkillName(req.skill_id)} from scratch (course + 1 practice project)`
            : `Improve ${getSkillName(req.skill_id)} from ${level} to ${required} (assessment + project evidence)`,
        skill_name: getSkillName(req.skill_id),
        readiness_gain: gain,
        effort: level === 0 ? "4-6 weeks" : gain > 8 ? "2-3 weeks" : "1 week",
      };
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.readiness_gain - a.readiness_gain);

  const projected = Math.min(100, current + actions.reduce((s, a) => s + a.readiness_gain, 0));

  return { current_readiness: current, projected_readiness: projected, actions };
}
