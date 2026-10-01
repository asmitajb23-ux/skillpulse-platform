import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SkillPulse collects, uses, shares and protects your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      updated="26 September 2026"
      intro="SkillPulse helps you prove your skills with evidence. Because that evidence is meant to be seen by recruiters and colleges, we are transparent about exactly what is shared, what stays private, and how you control it. This policy is written in plain language — the short version is: you decide what the world sees."
    >
      <LegalSection heading="1. Information we collect">
        <p>We collect only what is needed to run the platform:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Account details</strong> — your name, email address, role (student, recruiter or
            college admin) and, for students, your college, course and graduation year.
          </li>
          <li>
            <strong>Skill evidence</strong> — assessment attempts and scores, projects, certificates,
            AI viva sessions, and the verification scores derived from them.
          </li>
          <li>
            <strong>Preferences</strong> — your privacy settings, target job role and shortlists.
          </li>
          <li>
            <strong>Technical data</strong> — limited cookies and logs needed for authentication and
            security (see our <a className="text-primary hover:underline" href="/cookies">Cookie Policy</a>).
          </li>
        </ul>
        <p>
          We do <strong>not</strong> ask for government IDs, financial data, or any special-category
          sensitive information.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use your information">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>To calculate your skill readiness, proof chain and job-readiness insights.</li>
          <li>To let you build a portfolio, take assessments and complete AI viva sessions.</li>
          <li>To help recruiters discover candidates — only within the limits you set.</li>
          <li>To help college admins view aggregate and per-student analytics — only where permitted.</li>
          <li>To secure the platform, prevent abuse and meet legal obligations.</li>
        </ul>
        <p>We never sell your personal data. We do not use your skill evidence to train third-party models.</p>
      </LegalSection>

      <LegalSection heading="3. What you share — and your controls">
        <p>
          Visibility is yours to manage from{" "}
          <a className="text-primary hover:underline" href="/privacy-settings">Privacy Settings</a>.
          The controls are:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Profile visibility (Public / Private)</strong> — a private profile is hidden from
            recruiter search entirely.
          </li>
          <li>
            <strong>Skill Passport sharing (On / Off)</strong> — when off, your public passport link
            and QR code are disabled and the passport is visible only to you.
          </li>
          <li>
            <strong>Allow recruiters to view profile</strong> — recruiters can open your detailed
            evidence only when this is on and your profile is public.
          </li>
          <li>
            <strong>Allow college analytics access</strong> — controls whether your college admin can
            see your individual data in department analytics.
          </li>
          <li>
            <strong>Show contact email</strong> — your email is never displayed on your public Skill
            Passport unless you explicitly turn this on.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="4. The public Skill Passport">
        <p>
          Your Skill Passport is the one artefact designed to be shared. It only ever contains
          information you have chosen to make public: your professional identity, verified skills and
          their evidence breakdown, projects, certificates, assessment results and viva summaries.
          Private fields (such as your contact email) are excluded by default. Turning off passport
          sharing immediately disables the public link and QR code.
        </p>
      </LegalSection>

      <LegalSection heading="5. Recruiters and colleges">
        <p>
          <strong>Recruiters</strong> can access your profile only when your privacy settings permit
          it, and they see only the evidence you have made available. Shortlisting records the
          evidence that supported the decision — we do not generate arbitrary rankings.
        </p>
        <p>
          <strong>College admins</strong> can access data for students at their own institution,
          scoped by role-based authorization and, in production, database Row Level Security. Admins
          see individual student data only where the student has allowed college analytics access;
          otherwise the student is excluded from per-student views.
        </p>
      </LegalSection>

      <LegalSection heading="6. How we protect your data">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Authentication</strong> is handled by Supabase Auth. Passwords are never stored or
            handled by our own code in production.
          </li>
          <li>
            <strong>Row Level Security (RLS)</strong> policies restrict every table so users can only
            reach rows they are authorized to see.
          </li>
          <li>
            <strong>Secrets</strong> (API keys, service roles) live in environment variables and are
            never exposed to the browser. Only public, publishable keys are used client-side.
          </li>
          <li>
            <strong>Role-based authorization</strong> gates dashboards and data access by role at both
            the route and data layers.
          </li>
        </ul>
      </LegalSection>

      <LegalSection heading="7. Data retention">
        <p>
          We keep your data for as long as your account is active. You can request deletion at any
          time from Privacy Settings; on deletion we remove your profile, evidence and related records
          (or anonymize them where we must retain aggregates for institutional reporting).
        </p>
      </LegalSection>

      <LegalSection heading="8. Your rights">
        <p>Depending on where you live, you may have the right to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Access a copy of the personal data we hold about you.</li>
          <li>Correct inaccurate data (you can edit your profile at any time).</li>
          <li>Restrict or object to certain sharing (via your privacy controls).</li>
          <li>Request deletion of your account and data.</li>
          <li>Withdraw consent where processing is based on consent.</li>
        </ul>
        <p>
          To exercise any of these rights, use{" "}
          <a className="text-primary hover:underline" href="/privacy-settings">Privacy Settings</a> or
          contact us at <span className="font-medium text-slate-900">privacy@skillpulse.app</span>.
        </p>
      </LegalSection>

      <LegalSection heading="9. Children's privacy">
        <p>
          SkillPulse is intended for students in higher education and professionals. We do not
          knowingly collect data from children under 16. If you believe a child has provided us data,
          contact us and we will remove it.
        </p>
      </LegalSection>

      <LegalSection heading="10. Changes to this policy">
        <p>
          We may update this policy from time to time. Material changes will be highlighted in the app
          and the “Last updated” date above will change. Continued use after an update means you
          accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          Questions about privacy? Email{" "}
          <span className="font-medium text-slate-900">privacy@skillpulse.app</span>. For general
          terms, see our{" "}
          <a className="text-primary hover:underline" href="/terms">Terms of Service</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
