"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Building2, GraduationCap, Loader2, LogIn, UserRoundSearch, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { loginSchema } from "@/lib/validation";
import { roleHomePath } from "@/services/auth";
import { demoAccounts } from "@/data/demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/progress";

const DEMO_ROLE_META = [
  { role: "student" as const, label: "Student", icon: GraduationCap },
  { role: "recruiter" as const, label: "Recruiter", icon: UserRoundSearch },
  { role: "college_admin" as const, label: "College Admin", icon: Building2 },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get("next");

  const handleSubmit = async (e: React.FormEvent, demoEmail?: string, demoPassword?: string) => {
    e.preventDefault();
    const input = { email: demoEmail ?? email, password: demoPassword ?? password };
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const profile = await login(input.email, input.password);
      toast.success(`Welcome back, ${profile.name}!`);
      router.push(next && next.startsWith("/") ? next : roleHomePath(profile.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
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
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Log in to your SkillPulse account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Log in
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted-foreground">or try a demo account</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid gap-2">
          {demoAccounts.map((account) => {
            const meta = DEMO_ROLE_META.find((m) => m.role === account.role)!;
            return (
              <button
                key={account.email}
                type="button"
                disabled={submitting}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent, account.email, account.password)}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-indigo-50/50 disabled:opacity-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                  <meta.icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block font-medium">{meta.label} demo</span>
                  <span className="block text-xs text-muted-foreground">{account.email} · demo1234</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
              <Zap className="h-4.5 w-4.5" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Skill<span className="text-primary">Pulse</span>
            </span>
          </Link>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
