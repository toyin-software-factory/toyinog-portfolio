import Image from "next/image";
import Link from "next/link";

import { cx } from "./cx";

type CardProps = {
  readonly href: string;
  readonly title: string;
  /** Short context above the title, for example "Fintech · 2025". */
  readonly meta?: string;
  readonly summary?: string;
  readonly image?: { readonly src: string; readonly alt: string };
  /** Heading level for the title, to fit the page outline. */
  readonly headingLevel?: 2 | 3;
  readonly className?: string;
};

/**
 * A project card. The title link stretches over the whole card (a pseudo element),
 * so there is one link per card, and the focus ring wraps the card.
 */
export function Card({
  href,
  title,
  meta,
  summary,
  image,
  headingLevel = 3,
  className,
}: CardProps) {
  const Title = headingLevel === 2 ? "h2" : "h3";
  return (
    <article
      className={cx(
        "group relative flex flex-col gap-4 outline-offset-4 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-accent",
        className,
      )}
    >
      {image ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {meta ? <p className="text-label text-text-muted uppercase">{meta}</p> : null}
        <Title className="font-display text-h2 text-text">
          <Link
            href={href}
            className="decoration-1 underline-offset-4 group-hover:underline after:absolute after:inset-0 focus-visible:outline-none"
          >
            {title}
          </Link>
        </Title>
        {summary ? <p className="text-text-muted">{summary}</p> : null}
      </div>
    </article>
  );
}
