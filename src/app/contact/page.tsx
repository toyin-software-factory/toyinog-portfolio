import type { Metadata } from "next";

import { Container, Heading, TextLink } from "@/components/ui";
import { TURNSTILE_TEST_SITE_KEY } from "@/lib/contact/turnstile";
import { getProfile } from "@/lib/content";
import { getAppEnv } from "@/lib/env";

import { ContactForm } from "./ContactForm";
import { contactIntro } from "./intro";

// Prerendered. Only the form's server action runs on the Worker.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send Toyin Ogunseinde a message about a role or a project.",
  alternates: { canonical: "/contact" },
};

/** Outside production the published test key, so previews work on any host (spec 0001). */
const turnstileSiteKey = (): string =>
  getAppEnv() === "production"
    ? (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "")
    : TURNSTILE_TEST_SITE_KEY;

export default function ContactPage() {
  const profile = getProfile();

  return (
    <Container className="pt-16 pb-24 md:pt-24">
      <header className="flex max-w-prose flex-col gap-6 pb-12 md:pb-16">
        <Heading level={1} size="display">
          Contact
        </Heading>
        <p className="text-text-muted">{contactIntro(profile.availability)}</p>
      </header>

      <div className="grid grid-cols-1 gap-16 border-t border-rule pt-12 md:grid-cols-12 md:gap-10 md:pt-16">
        <div className="md:col-span-7">
          <noscript>
            <p className="mb-8 border-l-2 border-accent bg-surface p-5">
              This form needs JavaScript for its spam check. You can email me at {profile.email}.
            </p>
          </noscript>
          <ContactForm turnstileSiteKey={turnstileSiteKey()} email={profile.email} />
          <p id="contact-privacy" className="mt-6 text-small text-text-muted">
            Your message goes straight to my inbox and isn&apos;t stored on this site.
          </p>
        </div>

        <aside aria-labelledby="contact-elsewhere" className="md:col-span-4 md:col-start-9">
          <h2 id="contact-elsewhere" className="mb-6 text-label text-text-muted uppercase">
            Elsewhere
          </h2>
          <dl className="flex flex-col">
            <div className="flex flex-col gap-1 border-t border-rule py-4">
              <dt className="text-small text-text-muted">Email</dt>
              <dd className="break-words text-text">{profile.email}</dd>
            </div>
            <div className="flex flex-col gap-1 border-t border-rule py-4">
              <dt className="text-small text-text-muted">LinkedIn</dt>
              <dd>
                <TextLink href={profile.links.linkedin} external>
                  LinkedIn profile
                </TextLink>
              </dd>
            </div>
            <div className="flex flex-col gap-1 border-y border-rule py-4">
              <dt className="text-small text-text-muted">GitHub</dt>
              <dd>
                <TextLink href={profile.links.github} external>
                  GitHub profile
                </TextLink>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </Container>
  );
}
