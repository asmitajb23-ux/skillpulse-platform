import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/70 via-white to-white"
        aria-hidden
      />
      <div className="container relative py-20 text-center sm:py-28">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-medium text-indigo-700">
          <Sparkles className="h-3.5 w-3.5" />
          AI-Powered Skill Gap &amp; Portfolio Verification
        </div>

        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Prove Your Skills.{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            Build Your Future.
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          SkillPulse turns claims into evidence. Students verify skills through assessments,
          projects, certificates and AI viva — recruiters and colleges see exactly{" "}
          <em>why</em> a skill is verified, not just that it is.
        </p>

        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/#how-it-works">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              <ShieldCheck className="h-4 w-4" />
              Explore Skill Verification
            </Button>
          </Link>
        </div>

        <dl className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: "4", label: "Evidence sources" },
            { value: "100%", label: "Transparent scoring" },
            { value: "3", label: "User roles" },
            { value: "AI", label: "Viva interviewer" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-white p-4 card-shadow">
              <dt className="order-2 mt-1 text-xs font-medium text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 text-2xl font-bold text-primary">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
