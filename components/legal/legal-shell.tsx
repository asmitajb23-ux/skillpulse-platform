import Link from "next/link";
import { Zap } from "lucide-react";
import { Footer } from "@/components/landing/footer";

const LEGAL_NAV = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

export function LegalShell({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-30 border-b bg-white/90 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Zap className="h-4 w-4" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Skill<span className="text-primary">Pulse</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {LEGAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/"
            className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="container max-w-3xl py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          {intro && <p className="mt-6 text-base leading-relaxed text-slate-700">{intro}</p>}
          <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
