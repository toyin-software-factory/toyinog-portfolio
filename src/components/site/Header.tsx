import Link from "next/link";

import { Container } from "@/components/ui";

import { NavLinks } from "./NavLinks";

/** The id of the header, which the footer's "Back to top" link moves focus to. */
export const TOP_ID = "top";

/**
 * The site header (banner): Toyin's name linking home, and the Main nav.
 * It can take focus (`tabIndex={-1}`) so "Back to top" lands keyboard users here.
 */
export function Header({ name }: { readonly name: string }) {
  return (
    <header id={TOP_ID} tabIndex={-1} className="border-b border-rule">
      <Container className="flex flex-wrap items-center justify-between gap-x-6 py-3 md:py-5">
        <Link
          href="/"
          className="-ml-1 inline-flex min-h-11 items-center px-1 font-display text-h2 leading-none text-text transition-colors hover:text-accent"
        >
          {name}
        </Link>
        <nav aria-label="Main" className="-mr-2">
          <NavLinks />
        </nav>
      </Container>
    </header>
  );
}
