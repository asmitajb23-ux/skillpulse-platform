import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Building2,
  GraduationCap,
  Layers,
  Search,
  Target,
  UserRoundSearch,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AUDIENCES = [
  {
    id: "students",
    icon: GraduationCap,
    tag: "For Students",
    title: "Show what you can actually do",
    points: [
      { icon: Target, text: "Track readiness for your dream role with skill-gap analysis" },
      { icon: Layers, text: "Build a Skill Proof Chain from assessments, projects, certificates and AI viva" },
      { icon: Bot, text: "Practice interviews with an AI viva that evaluates every answer" },
      { icon: BarChart3, text: "Simulate job readiness and get prioritized next actions" },
    ],
    cta: { label: "Start as a Student", href: "/signup?role=student" },
  },
  {
    id: "recruiters",
    icon: UserRoundSearch,
    tag: "For Recruiters",
    title: "Hire on evidence, not resumes",
    points: [
      { icon: Search, text: "Search candidates by skill, target role and verified readiness" },
      { icon: Layers, text: "Inspect exactly why a skill is verified — see the full proof chain" },
      { icon: Users, text: "Compare candidates side by side on evidence, not arbitrary rankings" },
      { icon: Target, text: "Shortlist with confidence using assessment, project and viva scores" },
    ],
    cta: { label: "Start as a Recruiter", href: "/signup?role=recruiter" },
  },
  {
    id: "colleges",
    icon: Building2,
    tag: "For Colleges",
    title: "Know your students' real readiness",
    points: [
      { icon: BarChart3, text: "Institution-wide skill distribution and readiness analytics" },
      { icon: Target, text: "Identify top skill gaps across batches and target training" },
      { icon: Users, text: "Track individual student profiles, assessments and portfolios" },
      { icon: GraduationCap, text: "Report placement readiness with verifiable data" },
    ],
    cta: { label: "Start as College Admin", href: "/signup?role=college_admin" },
  },
];

export function Audiences() {
  return (
    <section className="container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Built for Everyone
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          One platform, three perspectives
        </h2>
      </div>

      <div className="mt-14 space-y-8">
        {AUDIENCES.map((audience, index) => (
          <div
            key={audience.id}
            id={audience.id}
            className="grid scroll-mt-24 items-center gap-8 rounded-2xl border bg-white p-8 card-shadow lg:grid-cols-2 lg:p-10"
          >
            <div className={index % 2 === 1 ? "lg:order-2" : ""}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-primary">
                <audience.icon className="h-3.5 w-3.5" />
                {audience.tag}
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{audience.title}</h3>
              <Link href={audience.cta.href} className="mt-6 inline-block">
                <Button>
                  {audience.cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <ul className={`space-y-4 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
              {audience.points.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                    <point.icon className="h-4 w-4" />
                  </span>
                  <p className="text-sm leading-relaxed text-slate-600">{point.text}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
