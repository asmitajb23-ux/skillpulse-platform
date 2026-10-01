import {
  Award,
  BarChart3,
  Bot,
  FolderKanban,
  Link2,
  Radar,
  Target,
  UserCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Radar,
    title: "Skill Assessments",
    description:
      "Timed MCQ and problem-solving assessments per skill, with detailed question-wise results and explanations.",
  },
  {
    icon: Link2,
    title: "Skill Proof Chain",
    description:
      "Every skill score shows its evidence: assessment results, project proof, certificates and AI viva performance — never a blind 'Verified' badge.",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Pick a target role and see required skills, your current level, missing skills, priority order and readiness percentage.",
  },
  {
    icon: Bot,
    title: "AI Viva",
    description:
      "An AI interviewer asks about your projects and skills, evaluates every answer and highlights strengths and areas to improve.",
  },
  {
    icon: FolderKanban,
    title: "Verified Portfolio",
    description:
      "Projects and certificates with GitHub links, live demos, credential URLs and verification status tracked end to end.",
  },
  {
    icon: BarChart3,
    title: "Job Readiness Simulator",
    description:
      "Simulate how closing each skill gap improves your readiness for a target role, with recommended next actions.",
  },
  {
    icon: UserCheck,
    title: "Recruiter Discovery",
    description:
      "Search candidates by skill, role and readiness. Compare evidence side by side and shortlist with confidence.",
  },
  {
    icon: Award,
    title: "Skill Passport",
    description:
      "A shareable, professional passport summarizing verified skills, proof chain, projects, certificates and viva results.",
  },
];

export function Features() {
  return (
    <section id="features" className="container scroll-mt-20 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Everything needed to prove real skill readiness
        </h2>
        <p className="mt-4 text-muted-foreground">
          One platform connecting students, recruiters and colleges through evidence-based
          skill verification.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-xl border bg-white p-6 card-shadow transition-shadow hover:card-shadow-md"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-primary">
              <feature.icon className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold">{feature.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
