import Link from "next/link";
import { Zap } from "lucide-react";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Students", href: "/#students" },
    { label: "For Recruiters", href: "/#recruiters" },
  ],
  Platform: [
    { label: "Log in", href: "/login" },
    { label: "Sign up", href: "/signup" },
    { label: "Student Dashboard", href: "/student" },
    { label: "Recruiter Dashboard", href: "/recruiter" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "Privacy Settings", href: "/privacy-settings" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <Zap className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Skill<span className="text-primary">Pulse</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              An AI-powered skill gap and portfolio verification platform. Evidence-based
              skill proof for students, recruiters and colleges.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold">{heading}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SkillPulse. Built for skill transparency.
          </p>
          <p className="text-xs text-muted-foreground">Prove Your Skills. Build Your Future.</p>
        </div>
      </div>
    </footer>
  );
}
