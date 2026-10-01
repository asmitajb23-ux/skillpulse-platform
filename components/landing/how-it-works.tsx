import { ClipboardCheck, LineChart, Search, ShieldCheck, TrendingUp } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Take timed skill assessments with MCQ and problem-solving questions.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description: "Attach evidence — projects, certificates and AI viva performance.",
  },
  {
    icon: LineChart,
    title: "Analyze",
    description: "Get a transparent Skill Verification Score with a full proof chain.",
  },
  {
    icon: TrendingUp,
    title: "Improve",
    description: "Close skill gaps with role-based recommendations and learning resources.",
  },
  {
    icon: Search,
    title: "Get Discovered",
    description: "Recruiters and colleges find you through evidence-backed search.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-y bg-slate-50/70 py-20">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Skill Verification Workflow
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            From claim to proof in five steps
          </h2>
          <p className="mt-4 text-muted-foreground">
            A transparent pipeline that turns self-reported skills into verified, evidence-based
            readiness.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border bg-white p-6 card-shadow">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="text-3xl font-bold text-slate-100">{i + 1}</span>
              </div>
              <h3 className="text-sm font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
