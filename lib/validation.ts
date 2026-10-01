import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "recruiter", "college_admin"], {
      required_error: "Select a role to continue",
    }),
    consent: z.literal(true, {
      errorMap: () => ({ message: "You must accept the Terms and Privacy Policy" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const studentProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  college: z.string().min(2, "College is required"),
  course: z.string().min(2, "Course is required"),
  graduation_year: z.coerce
    .number()
    .int("Must be a whole year")
    .min(2020, "Enter a valid year")
    .max(2035, "Enter a valid year"),
  headline: z.string().max(120, "Keep it under 120 characters").optional().or(z.literal("")),
  target_role_id: z.string().min(1, "Select a target role"),
  skills: z
    .array(z.object({ skill_id: z.string(), level: z.number().min(0).max(100) }))
    .min(1, "Add at least one skill"),
});

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Describe your project in at least 20 characters"),
  technologies: z.string().min(2, "Add at least one technology (comma separated)"),
  github_url: z
    .string()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  live_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  evidence: z.string().max(500, "Keep evidence under 500 characters").optional().or(z.literal("")),
});

export const certificateSchema = z.object({
  name: z.string().min(3, "Certificate name is required"),
  issuer: z.string().min(2, "Issuer is required"),
  date: z.string().min(1, "Date is required"),
  credential_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  skill_id: z.string().optional().or(z.literal("")),
});

export const vivaAnswerSchema = z
  .string()
  .min(20, "Answer in at least 20 characters so it can be evaluated properly");

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type CertificateInput = z.infer<typeof certificateSchema>;
