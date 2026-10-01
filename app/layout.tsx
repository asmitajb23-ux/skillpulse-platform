import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "SkillPulse — AI-Powered Skill Gap & Portfolio Verification",
    template: "%s | SkillPulse",
  },
  description:
    "Prove your skills with evidence-based verification. SkillPulse helps students demonstrate real skill readiness through assessments, projects, certificates and AI viva — and helps recruiters and colleges discover verified talent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
