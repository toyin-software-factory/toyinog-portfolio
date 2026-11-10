import Link from "next/link";

import { TextLink } from "@/components/ui";

type NextProjectProps = {
  readonly next: { readonly slug: string; readonly title: string } | null;
};

/** The case study footer: a large "Next project" link (wrapping to the first) and "Back to all work". */
export function NextProject({ next }: NextProjectProps) {
  return (
    <nav aria-label="More work" className="flex flex-col gap-6 border-t border-rule pt-10 md:pt-14">
      {next ? (
        <Link
          href={`/work/${next.slug}`}
          className="group flex flex-col gap-2 self-start py-2 transition-colors"
        >
          <span className="text-label text-text-muted uppercase">Next project</span>
          <span className="font-display text-h1 text-text underline decoration-1 underline-offset-8 group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : null}
      <TextLink href="/work" className="self-start">
        Back to all work
      </TextLink>
    </nav>
  );
}

/** The project after `slug` in `ordered`, wrapping to the first. `null` when it's the only one. */
export function nextProjectOf<T extends { readonly slug: string }>(
  ordered: readonly T[],
  slug: string,
): T | null {
  const index = ordered.findIndex((project) => project.slug === slug);
  if (index === -1 || ordered.length < 2) return null;
  return ordered[(index + 1) % ordered.length] ?? null;
}
