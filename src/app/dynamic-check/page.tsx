import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Container, Heading } from "@/components/ui";
import { getAppEnv } from "@/lib/env";

/**
 * A preview only page rendered at request time (spec 0004 AC-12). It proves the
 * shell renders on Workers without reading `content/`: the e2e test in
 * tests/e2e/dynamic.spec.ts expects 200 with the header and footer. Production
 * builds return the 404 page.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dynamic check",
  robots: { index: false, follow: false },
};

export default async function DynamicCheckPage() {
  if (getAppEnv() === "production") notFound();
  // Opt in to request time rendering explicitly, so this can never be prerendered.
  await connection();
  return (
    <Container className="flex flex-col gap-4 py-16 md:py-24">
      <Heading level={1}>Dynamic check</Heading>
      <p className="text-text-muted">
        Rendered on request at{" "}
        <time dateTime={new Date().toISOString()}>{new Date().toISOString()}</time>.
      </p>
    </Container>
  );
}
