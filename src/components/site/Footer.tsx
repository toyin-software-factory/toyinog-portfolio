import { Container, TextLink } from "@/components/ui";
import { cx } from "@/components/ui/cx";
import { textLinkClass } from "@/components/ui/TextLink";
import type { Profile } from "@/lib/content";

import { TOP_ID } from "./Header";

type FooterProps = {
  readonly profile: Pick<Profile, "name" | "links" | "email">;
  /** The build year, so the copyright line is fixed in the prebuilt HTML. */
  readonly year: number;
};

/** The site footer (contentinfo): name, profile links, copyright and "Back to top". */
export function Footer({ profile, year }: FooterProps) {
  return (
    <footer className="border-t border-rule">
      <Container className="flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between md:py-14">
        <div className="flex flex-col gap-3">
          <p className="font-display text-h2 text-text">{profile.name}</p>
          <ul aria-label="Elsewhere" className="flex flex-wrap gap-x-6">
            <li>
              <TextLink href={profile.links.linkedin} external>
                LinkedIn
              </TextLink>
            </li>
            <li>
              <TextLink href={profile.links.github} external>
                GitHub
              </TextLink>
            </li>
            <li>
              {/* A mailto link, so not marked external: it opens the visitor's mail app. */}
              <a
                href={`mailto:${profile.email}`}
                className={cx(textLinkClass, "inline-flex items-baseline")}
              >
                Email
              </a>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 md:flex-col md:items-end">
          {/* A plain anchor, not next/link: the browser moves focus to the header (tabIndex -1). */}
          <a href={`#${TOP_ID}`} className={cx(textLinkClass, "inline-flex min-h-11 items-center")}>
            Back to top
          </a>
          <p className="text-small text-text-muted">
            © {year} {profile.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
