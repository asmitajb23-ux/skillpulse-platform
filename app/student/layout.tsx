import type { Metadata } from "next";
import {
  Award,
  Bot,
  FolderKanban,
  Gauge,
  IdCard,
  LayoutDashboard,
  Link2,
  ShieldCheck,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

const NAV_ITEMS: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/student/profile", label: "My Profile", icon: <User className="h-4 w-4" /> },
  { href: "/student/assessments", label: "Assessments", icon: <Trophy className="h-4 w-4" /> },
  { href: "/student/skill-gap", label: "Skill Gap Analysis", icon: <Target className="h-4 w-4" /> },
  { href: "/student/proof-chain", label: "Skill Proof Chain", icon: <Link2 className="h-4 w-4" /> },
  { href: "/student/portfolio", label: "Portfolio", icon: <FolderKanban className="h-4 w-4" /> },
  { href: "/student/certificates", label: "Certificates", icon: <Award className="h-4 w-4" /> },
  { href: "/student/viva", label: "AI Viva", icon: <Bot className="h-4 w-4" /> },
  { href: "/student/job-simulator", label: "Job Simulator", icon: <Gauge className="h-4 w-4" /> },
  { href: "/student/passport", label: "Skill Passport", icon: <IdCard className="h-4 w-4" /> },
  { href: "/privacy-settings", label: "Privacy Settings", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
