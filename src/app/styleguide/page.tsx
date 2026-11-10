import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge, Container, Heading } from "@/components/ui";
import { getAppEnv } from "@/lib/env";

import { ActionsSection } from "./ActionsSection";
import { ColourSection } from "./ColourSection";
import { DisplaySection } from "./DisplaySection";
import { FormsSection } from "./FormsSection";
import { LayoutSection } from "./LayoutSection";
import { ProseSection } from "./ProseSection";
import { TypeSection } from "./TypeSection";

// Built once at build time. APP_ENV is baked into each build, so production builds
// prerender this route as a 404.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

export default function StyleguidePage() {
  if (getAppEnv() === "production") notFound();

  return (
    <Container className="pt-16 pb-24 md:pt-24">
      <header className="flex max-w-prose flex-col gap-6 pb-16 md:pb-24">
        <p className="text-label text-text-muted uppercase">Design system · spec 0003</p>
        <Heading level={1} size="display">
          Styleguide
        </Heading>
        <p className="text-text-muted">
          Every token and base component in one place, in its states. Editorial and dark, with
          Toyin&apos;s yellows kept for links, focus and calls to action.
        </p>
        <div>
          <Badge>Preview only</Badge>
        </div>
      </header>
      <ColourSection />
      <TypeSection />
      <LayoutSection />
      <ActionsSection />
      <DisplaySection />
      <FormsSection />
      <ProseSection />
    </Container>
  );
}
