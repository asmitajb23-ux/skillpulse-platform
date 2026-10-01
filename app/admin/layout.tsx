import type { Metadata } from "next";
import { BarChart3, LayoutDashboard, ShieldCheck, Users } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "College Admin Dashboard",
};

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/students", label: "Students", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/privacy-settings", label: "Privacy Settings", icon: <ShieldCheck className="h-4 w-4" /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AppShell navItems={NAV_ITEMS}>{children}</AppShell>;
}
