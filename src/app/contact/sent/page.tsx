import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ButtonLink, Container, Heading } from "@/components/ui";

import { SENT_COOKIE } from "../sentCookie";
import { ClearSentCookie } from "./ClearSentCookie";

// Reads the cookie on every request, so it can't be prerendered.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Message sent",
  robots: { index: false, follow: false },
};

/**
 * The thank you page and the analytics conversion (spec 0007, AC-10). It renders only
 * right after a send, when the short lived cookie is present; otherwise it sends the
 * visitor to /contact, so direct visits don't count.
 */
export default async function ContactSentPage() {
  if (!(await cookies()).has(SENT_COOKIE.name)) redirect("/contact");

  return (
    <Container className="pt-16 pb-24 md:pt-24">
      <div className="flex max-w-prose flex-col gap-6">
        <p className="text-label text-text-muted uppercase">Contact</p>
        <Heading level={1} size="display">
          Thanks, your message is on its way
        </Heading>
        <p className="text-text-muted">
          It&apos;s gone straight to my inbox. I read every message and reply from my own email.
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <ButtonLink href="/">Back to Home</ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            See the work
          </ButtonLink>
        </div>
      </div>
      <ClearSentCookie />
    </Container>
  );
}
