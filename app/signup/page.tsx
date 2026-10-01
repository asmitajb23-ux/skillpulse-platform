"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Building2, GraduationCap, Loader2, UserPlus, UserRoundSearch, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { signupSchema } from "@/lib/validation";
import { roleHomePath } from "@/services/auth";
import type { Role } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  {
    value: "student",
    label: "Student",
    description: "Prove your skills and get discovered",
    icon: GraduationCap,
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Find and verify skilled candidates",
    icon: UserRoundSearch,
  },
  {
    value: "college_admin",
    label: "College Admin",
    description: "Track student skill readiness",
    icon: Building2,
  },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role | "">((searchParams.get("role") as Role) || "");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword, role, consent });
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
    setSubmitting(true);
    try {
      const profile = await signup(name, email, password, role as Role);
      toast.success("Account created! Welcome to SkillPulse.");
      router.push(roleHomePath(profile.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>You are already signed in</CardTitle>
          <CardDescription>Logged in as {user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={roleHomePath(user.role)}>
            <Button className="w-full">Go to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Create your account</CardTitle>
        <CardDescription>Join SkillPulse and start proving your skills</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label>
              I am a <span className="text-destructive">*</span>
            </Label>
            <div className="grid gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setRole(option.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                    role === option.value
                      ? "border-primary bg-indigo-50/60 ring-1 ring-primary"
                      : "hover:border-primary/40 hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      role === option.value ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <option.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{option.label}</span>
                    <span className="block text-xs text-muted-foreground">{option.description}</span>
                  </span>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-destructive">{errors.role}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-input text-primary accent-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="font-medium text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-primary hover:underline">
                  Privacy Policy
                </Link>
                . <span className="text-destructive">*</span>
              </span>
            </label>
            {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Skill<span className="text-primary">Pulse</span>
            </span>
          </Link>
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
