import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How and why SkillPulse uses cookies and similar technologies.",
};

const COOKIE_TABLE = [
  {
    name: "sp_session",
    type: "Authentication",
    purpose: "Keeps you signed in and lets us apply role-based access and route protection.",
    duration: "7 days",
  },
  {
    name: "sb-* (Supabase)",
    type: "Authentication",
    purpose: "Set by Supabase Auth when connected, to maintain your secure login session and tokens.",
    duration: "Session / as set by Supabase",
  },
  {
    name: "skillpulse:* (local storage)",
    type: "Functional",
    purpose:
      "Stores your working data and preferences locally (e.g. privacy settings, draft portfolio items) so the app is responsive and remembers your choices.",
    duration: "Until cleared",
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalShell
      title="Cookie Policy"
      updated="26 September 2026"
      intro="This policy explains the small amount of data SkillPulse stores on your device to keep you signed in and remember your preferences. We keep it minimal — no advertising or cross-site tracking cookies."
    >
      <LegalSection heading="1. What cookies are">
        <p>
          Cookies and similar technologies (like local storage) are small pieces of data a website
          saves on your device. They let the site recognize you between pages and visits, keep you
          logged in, and remember your settings.
        </p>
      </LegalSection>

      <LegalSection heading="2. What we use and why">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2.5 font-semibold">Name</th>
                <th className="px-3 py-2.5 font-semibold">Type</th>
                <th className="px-3 py-2.5 font-semibold">Purpose</th>
                <th className="px-3 py-2.5 font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {COOKIE_TABLE.map((c) => (
                <tr key={c.name} className="align-top">
                  <td className="px-3 py-2.5 font-mono text-slate-900">{c.name}</td>
                  <td className="px-3 py-2.5">{c.type}</td>
                  <td className="px-3 py-2.5">{c.purpose}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{c.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          All of these are <strong>strictly necessary</strong> or <strong>functional</strong>. We do
          not use third-party advertising cookies or build cross-site tracking profiles.
        </p>
      </LegalSection>

      <LegalSection heading="3. Analytics">
        <p>
          If we add privacy-respecting, aggregate analytics in future, we will update this policy and,
          where required, ask for your consent first. We do not currently run ad or behavioural
          tracking scripts.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your choices">
        <p>
          Most browsers let you view, manage or delete cookies in their settings. Because our cookies
          are essential for sign-in and route protection, blocking them will stop the app from working
          correctly (for example, you may be logged out repeatedly). You can clear local storage at
          any time from your browser; this resets locally stored demo data and preferences.
        </p>
      </LegalSection>

      <LegalSection heading="5. Changes">
        <p>
          We may update this policy if our use of cookies changes. The “Last updated” date above will
          reflect the latest version. See also our{" "}
          <a className="text-primary hover:underline" href="/privacy">Privacy Policy</a>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact">
        <p>
          Questions about cookies? Email{" "}
          <span className="font-medium text-slate-900">privacy@skillpulse.app</span>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
