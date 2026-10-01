import type { Metadata } from "next";
import { GitCompareArrows, LayoutDashboard, ShieldCheck, Star } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Recruiter Dashboard",
};

const NAV_ITEMS: NavItem[] = [
  { href: "/recruiter", label: "Find Candidates", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/recruiter/compare", label: "Compare", icon: <GitCompareArrows className="h-4 w-4" /> },
  { href: "/recruiter/shortlist", label: "Shortlist", icon: <Star className="h-4 w-4" /> },
  { href: "/privacy-settings", label: "Privacy Settings", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
