import { Badge, ButtonLink, Container, Heading } from "@/components/ui";
import type { Profile } from "@/lib/content";

import { AVAILABILITY_BADGE } from "./copy";

type HeroProps = {
  readonly profile: Pick<Profile, "name" | "headline" | "intro" | "availability">;
};

/** Home hero: the page's only h1 (the name), headline, intro, availability and two actions. */
export function Hero({ profile }: HeroProps) {
  const badge = AVAILABILITY_BADGE[profile.availability];
  return (
    <section aria-labelledby="hero-title" className="pt-16 pb-16 md:pt-28 md:pb-24">
      <Container className="flex flex-col items-start gap-6 md:gap-8">
        {badge ? <Badge>{badge}</Badge> : null}
        <Heading level={1} size="display" id="hero-title">
          {profile.name}
        </Heading>
        <p className="max-w-prose text-h3 font-normal text-balance text-text">{profile.headline}</p>
        <p className="max-w-prose text-text-muted">{profile.intro}</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/work">See my work</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Get in touch
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
