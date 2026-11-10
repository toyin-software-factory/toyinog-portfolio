import type { Metadata } from "next";

import { ButtonLink, Container, Heading } from "@/components/ui";

// Static: src/middleware.ts lets visitors in only right after a send, then clears the cookie.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Message sent",
  robots: { index: false, follow: false },
};

/**
 * The thank you page and the analytics conversion (spec 0007, AC-10). The cookie gate
 * lives in `src/middleware.ts`, so direct visits are sent to /contact and don't count.
 */
export default function ContactSentPage() {
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
    </Container>
  );
}
