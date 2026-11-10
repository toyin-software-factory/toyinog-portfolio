import type { Metadata } from "next";

import { ButtonLink, Container, Heading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
};

/** The 404 page, shown inside the site shell for any unknown URL (spec 0004, AC-9). */
export default function NotFound() {
  return (
    <section aria-labelledby="not-found-title" className="py-24 md:py-36">
      <Container className="flex flex-col items-start gap-6">
        <p className="text-label text-text-muted uppercase">Error 404</p>
        <Heading level={1} size="display" id="not-found-title">
          Page not found
        </Heading>
        <p className="max-w-prose text-text-muted">
          This page doesn&apos;t exist, or it moved. Try the home page or the work.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/">Go to Home</ButtonLink>
          <ButtonLink href="/work" variant="secondary">
            See the work
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
