import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { APP_NAME, APP_ONE_LINE, LEGAL_CONTACT, LEGAL_LAST_UPDATED } from "@/lib/constants";

export const metadata: Metadata = { title: "Terms of Service", robots: { index: true } };

const contact = (
  <a href={LEGAL_CONTACT} className="text-canal underline underline-offset-4">
    {LEGAL_CONTACT}
  </a>
);

export default function TermsPage() {
  return (
    <LegalPage
      title={`Terms of Service — ${APP_NAME}`}
      updated={LEGAL_LAST_UPDATED}
      sections={[
        { heading: "Agreement", body: <p>By using {APP_NAME}, you agree to these terms.</p> },
        {
          heading: "The service",
          body: (
            <p>
              {APP_ONE_LINE} {APP_NAME} is provided &quot;as is,&quot; operated by a single individual (Beto Labs), without warranty of any kind, express or
              implied, including fitness for a particular purpose or uninterrupted availability.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              You agree not to use {APP_NAME} to violate any law, to harass, stalk or harm others, to attempt to gain unauthorized access to the service or
              its data, or to abuse the service in a way that degrades it. Only store information about other people that they shared with you or made
              public, and honor requests to remove it. Respect the terms of any site whose link you paste.
            </p>
          ),
        },
        {
          heading: "Your content",
          body: (
            <p>
              You retain ownership of any content you submit. By submitting content, you grant us the limited right to process and store it solely to
              provide the service to you, as described in the Privacy Policy.
            </p>
          ),
        },
        {
          heading: "Link previews and name search",
          body: (
            <p>
              Details pulled from a public link preview, and profiles suggested by name search (powered by Anthropic&apos;s Claude), may be incomplete,
              outdated, or belong to a different person with the same name. Check before saving.
            </p>
          ),
        },
        {
          heading: "Termination",
          body: <p>We may suspend or terminate access for violation of these terms. You may stop using the service, or request deletion, at any time via {contact}.</p>,
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the fullest extent permitted by law, {APP_NAME} and its operator are not liable for any indirect, incidental, or consequential damages
              arising from use of the service.
            </p>
          ),
        },
        {
          heading: "Changes to these terms",
          body: (
            <p>
              We may update these terms as the app changes. Material changes will update the &quot;Last updated&quot; date above. Continued use after a
              change constitutes acceptance.
            </p>
          ),
        },
        { heading: "Contact", body: <p>For any question about these terms, contact us via {contact}.</p> },
      ]}
    />
  );
}
