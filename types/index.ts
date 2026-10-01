// ============================================================
// SkillPulse domain types — mirrors the Supabase schema in
// supabase/schema.sql
// ============================================================

export type Role = "student" | "recruiter" | "college_admin";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface RoleSkillRequirement {
  skill_id: string;
  weight: number; // importance of this skill for the role (1-5)
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  required_skills: RoleSkillRequirement[];
}

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export interface StudentSkill {
  skill_id: string;
  level: number; // 0-100 proficiency
}

export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  college: string;
  course: string;
  graduation_year: number;
  headline: string;
  skills: StudentSkill[];
  target_role_id: string | null;
  profile_completion: number; // 0-100
}

export interface RecruiterProfile {
  id: string;
  email: string;
  name: string;
  company: string;
  company_size: string;
  hiring_for: string[];
}

export interface CollegeProfile {
  id: string;
  email: string;
  name: string;
  college_name: string;
  department: string;
  total_students: number;
}

// ---------------- Assessments ----------------

export type QuestionType = "mcq" | "coding";

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[]; // for mcq
  correct_option?: number; // index for mcq
  keywords?: string[]; // for coding answer checking (mock evaluation)
  points: number;
  explanation: string;
}

export interface Assessment {
  id: string;
  skill_id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  student_id: string;
  skill_id: string;
  score: number;
  total: number;
  percentage: number;
  time_taken_seconds: number;
  completed_at: string;
  answers: { question_id: string; answer: string; correct: boolean }[];
}

// ---------------- Portfolio ----------------

export type VerificationStatus = "unverified" | "pending" | "verified";

export interface Project {
  id: string;
  student_id: string;
  title: string;
  description: string;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  evidence: string | null;
  skills: string[]; // skill ids this project demonstrates
  verification_status: VerificationStatus;
  created_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  name: string;
  issuer: string;
  date: string;
  credential_url: string | null;
  skill_id: string | null;
  verification_status: VerificationStatus;
}

// ---------------- Skill Proof Chain ----------------

export interface EvidenceBreakdown {
  source: "assessment" | "project" | "certificate" | "viva";
  label: string;
  detail: string;
  contribution: number; // points contributed to verification score
  max_contribution: number;
}

export interface SkillProof {
  skill_id: string;
  skill_name: string;
  level: number;
  verification_score: number; // 0-100 evidence-weighted
  verification_status: VerificationStatus;
  breakdown: EvidenceBreakdown[];
}

// ---------------- AI Viva ----------------

export interface VivaQuestion {
  question: string;
  evaluation?: string;
  score?: number; // 0-100 per answer
  feedback?: string;
}

export interface VivaSession {
  id: string;
  student_id: string;
  topic_type: "project" | "skill";
  topic_id: string;
  topic_name: string;
  questions: VivaQuestion[];
  answers: string[];
  score: number;
  strengths: string[];
  improvements: string[];
  completed_at: string;
}

// ---------------- Learning ----------------

export interface LearningResource {
  id: string;
  skill_id: string;
  title: string;
  provider: string;
  resource_type: "course" | "documentation" | "practice" | "video";
  url: string;
  level: SkillLevel;
}

// ---------------- Recruiter ----------------

export interface Shortlist {
  id: string;
  recruiter_id: string;
  student_id: string;
  role_id: string | null;
  note: string | null;
  created_at: string;
}

export interface SkillGapResult {
  role_id: string;
  role_title: string;
  readiness_percentage: number;
  required_skills: {
    skill_id: string;
    skill_name: string;
    weight: number;
    current_level: number;
    required_level: number;
    status: "strong" | "developing" | "missing";
    priority: "high" | "medium" | "low";
  }[];
  missing_skills: string[];
  resources: LearningResource[];
}

export interface JobReadinessSimulation {
  current_readiness: number;
  projected_readiness: number;
  actions: {
    label: string;
    skill_name: string;
    readiness_gain: number;
    effort: string;
  }[];
}

// ---------------- Admin analytics ----------------

export interface AdminStats {
  total_students: number;
  active_students: number;
  average_readiness: number;
  verified_skill_count: number;
  assessments_taken: number;
  placement_ready: number;
}

export interface SkillDistribution {
  skill: string;
  students: number;
  average_level: number;
}

export interface SkillGapTrend {
  skill: string;
  students_missing: number;
  demand_weight: number;
}

export interface ReadinessBucket {
  range: string;
  count: number;
}

// ---------------- Privacy & Security ----------------

export type ProfileVisibility = "public" | "private";

export interface PrivacySettings {
  profile_visibility: ProfileVisibility;
  passport_sharing: boolean;
  allow_recruiter_access: boolean;
  allow_college_analytics: boolean;
  show_contact_email: boolean;
}

export type DeletionStatus = "pending" | "completed" | "cancelled";

export interface DataDeletionRequest {
  id: string;
  user_id: string;
  email: string;
  status: DeletionStatus;
  reason: string | null;
  requested_at: string;
}
