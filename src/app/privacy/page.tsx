import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { APP_NAME, APP_ONE_LINE, LEGAL_CONTACT, LEGAL_LAST_UPDATED } from "@/lib/constants";

export const metadata: Metadata = { title: "Privacy Policy", robots: { index: true } };

const contact = (
  <a href={LEGAL_CONTACT} className="text-canal underline underline-offset-4">
    {LEGAL_CONTACT}
  </a>
);

export default function PrivacyPage() {
  return (
    <LegalPage
      title={`Privacy Policy — ${APP_NAME}`}
      updated={LEGAL_LAST_UPDATED}
      sections={[
        {
          heading: "What this application does",
          body: (
            <p>
              {APP_ONE_LINE} {APP_NAME} is built and operated by a single individual (Beto Labs) — not a company, and there is no dedicated support team or
              account manager. It is a private, password-protected tool used by its operator and the people they share the password with.
            </p>
          ),
        },
        {
          heading: "Information we collect",
          body: (
            <ul className="list-disc pl-5">
              <li>Details you enter about people you meet: name, what they do, company, location, notes, tags, and the dates and context of meetings.</li>
              <li>Contact links you choose to save: LinkedIn URL, Instagram handle, WhatsApp number, email, website.</li>
              <li>Photos you upload (resized on your device before upload) or that are copied from a public link preview.</li>
              <li>A session cookie that keeps you signed in. No analytics or advertising cookies.</li>
            </ul>
          ),
        },
        {
          heading: "Public link previews",
          body: (
            <p>
              When you paste a link, the app requests that one public page once, the same way a messaging app builds a link preview, and reads only the
              title, description and preview image the page publishes for sharing. It does not log in to any service, does not crawl beyond that one page,
              and many services (LinkedIn, Instagram) decline to share anything — in that case nothing is collected and you fill in details yourself.
            </p>
          ),
        },
        {
          heading: "Name search",
          body: (
            <p>
              When you search by name, the name you typed (and any extra detail you add, such as a company or city) is sent to Anthropic&apos;s Claude API,
              which runs a web search limited to linkedin.com and instagram.com and returns public profile links and titles. Nothing from your saved
              register is sent. Anthropic&apos;s handling of API data is governed by its own published privacy and data usage policies.
            </p>
          ),
        },
        {
          heading: "How your information is used",
          body: (
            <p>
              Your data is used solely to provide {APP_NAME}&apos;s functionality to you. The only AI provider used is Anthropic (Claude), and only for
              name search as described above.
            </p>
          ),
        },
        {
          heading: "Third parties we share data with",
          body: (
            <p>
              Vercel (hosting), Supabase (database) and Anthropic (name search). These are infrastructure subprocessors — they process data on our behalf to run the app, not on
              their own account. We do not sell, rent, or license your data to any party. We do not use your data for advertising, marketing, or profiling.
              We do not use your data to train any machine learning model.
            </p>
          ),
        },
        {
          heading: "Categories of data, purpose, and retention (CCPA/CalOPPA)",
          body: (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Purpose</th>
                    <th className="py-2">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-line">
                    <td className="py-2 pr-3">Contact details and notes</td>
                    <td className="py-2 pr-3">Remembering who you met</td>
                    <td className="py-2">Until you delete the person</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-2 pr-3">Meeting dates and context</td>
                    <td className="py-2 pr-3">Your meeting history</td>
                    <td className="py-2">Until you delete the meeting or person</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3">Photos</td>
                    <td className="py-2 pr-3">Recognizing faces</td>
                    <td className="py-2">Until you remove the photo or delete the person</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          heading: "Data retention and deletion",
          body: (
            <p>
              Deleting a person in the app permanently deletes their record, every meeting with them, and their photo from the database. Photos are stored in
              the database itself (not a separate file store), so removing one removes it. Removing a single meeting deletes just that meeting. Database
              backups kept by our hosting provider may retain deleted data for a limited period before they expire. For any other deletion request, contact
              us at {contact}.
            </p>
          ),
        },
        {
          heading: "Other people's information",
          body: (
            <p>
              This app stores information about people other than its user. Only save what those people shared with you or made public, and respect requests
              from anyone who asks to be removed.
            </p>
          ),
        },
        {
          heading: "Security",
          body: (
            <p>
              A shared password with an encrypted, http-only session cookie (iron-session) protects every page and API. Database access requires a
              server-only secret enforced by row-level security. Secrets are never logged. We use industry-standard hosting (Vercel) and database (Supabase)
              providers with their own security practices layered under ours.
            </p>
          ),
        },
        {
          heading: "Children's privacy",
          body: <p>{APP_NAME} is not directed at children under 13, and we do not knowingly collect data from children under 13.</p>,
        },
        {
          heading: "Changes to this policy",
          body: <p>We may update this policy as the app changes. Material changes will update the &quot;Last updated&quot; date above.</p>,
        },
        { heading: "Contact", body: <p>For any question about this policy, contact us via {contact}.</p> },
      ]}
    />
  );
}
