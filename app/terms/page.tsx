import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/legal/legal-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using SkillPulse.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      updated="26 September 2026"
      intro="These terms govern your use of SkillPulse. By creating an account or using the platform you agree to them. Please read them together with our Privacy Policy and Cookie Policy."
    >
      <LegalSection heading="1. About SkillPulse">
        <p>
          SkillPulse is a skill gap analysis and portfolio verification platform. It helps students
          demonstrate evidence-backed skills, helps recruiters discover verified candidates, and helps
          colleges track readiness. Verification scores are calculated from evidence you and the
          platform provide (assessments, projects, certificates, AI viva).
        </p>
      </LegalSection>

      <LegalSection heading="2. Your account">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>You must provide accurate information and keep your credentials secure.</li>
          <li>You are responsible for activity that occurs under your account.</li>
          <li>You must be at least 16 years old, or use the platform under institutional supervision.</li>
          <li>One person per account — do not share logins.</li>
        </ul>
      </LegalSection>

      <LegalSection heading="3. Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>Submit false, plagiarized or misleading skill evidence, projects or certificates.</li>
          <li>Attempt to game, reverse-engineer or tamper with assessments, scoring or verification.</li>
          <li>Scrape, bulk-download or resell candidate data.</li>
          <li>Use the platform for unlawful discrimination or to harass others.</li>
          <li>Upload malware or attempt to disrupt or gain unauthorized access to the service.</li>
        </ul>
        <p>
          We may suspend or terminate accounts that violate these terms. Because honesty is the whole
          point of SkillPulse, misrepresenting skills is treated seriously.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your content and ownership">
        <p>
          You keep ownership of everything you upload (projects, descriptions, evidence). You grant
          SkillPulse a limited licence to host and display that content to the audiences you authorize
          through your privacy settings — and to no one else. You are responsible for having the right
          to share any content you submit.
        </p>
      </LegalSection>

      <LegalSection heading="5. Verification is evidence-based, not a guarantee">
        <p>
          Verification scores reflect the evidence available at a point in time. SkillPulse does not
          guarantee employment, placement outcomes, or the accuracy of third-party claims (such as an
          external certificate issuer). Recruiters and colleges must make their own decisions; we do
          not produce arbitrary rankings of people.
        </p>
      </LegalSection>

      <LegalSection heading="6. Recruiter and college use">
        <p>
          Recruiters and college admins agree to use candidate data only for legitimate hiring,
          mentoring and institutional analytics purposes, to respect candidate privacy settings, and
          not to export or share candidate data beyond their organization.
        </p>
      </LegalSection>

      <LegalSection heading="7. Privacy">
        <p>
          Our handling of your data is described in the{" "}
          <a className="text-primary hover:underline" href="/privacy">Privacy Policy</a>. You control
          sharing from{" "}
          <a className="text-primary hover:underline" href="/privacy-settings">Privacy Settings</a>.
        </p>
      </LegalSection>

      <LegalSection heading="8. Availability and changes">
        <p>
          We aim to keep SkillPulse available but may modify, suspend or discontinue features (for
          maintenance or product changes) without liability. We may update these terms; material
          changes will be announced in the app and the “Last updated” date will change.
        </p>
      </LegalSection>

      <LegalSection heading="9. Termination and data deletion">
        <p>
          You may close your account at any time and request deletion of your data from Privacy
          Settings. We may terminate access for breaches of these terms. On deletion, the process
          described in the Privacy Policy applies.
        </p>
      </LegalSection>

      <LegalSection heading="10. Disclaimers and liability">
        <p>
          The platform is provided “as is” without warranties of any kind. To the maximum extent
          permitted by law, SkillPulse is not liable for indirect or consequential damages arising
          from your use of the service. Nothing here limits liability that cannot lawfully be limited.
        </p>
      </LegalSection>

      <LegalSection heading="11. Contact">
        <p>
          Questions about these terms? Email{" "}
          <span className="font-medium text-slate-900">legal@skillpulse.app</span>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
