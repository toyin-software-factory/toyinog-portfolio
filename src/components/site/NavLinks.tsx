"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/components/ui/cx";

/** The three always visible destinations (spec 0004, Home Q2: no menu button). */
export const NAV_ITEMS = [
  { href: "/work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** True when `pathname` is the section at `href` or a page inside it (`/work/<slug>` is Work). */
export function isCurrentSection(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * The header's links. The only client component in the shell: it reads the
 * current path to mark the active link with `aria-current="page"` and the lemon underline.
 */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 sm:gap-2">
      {NAV_ITEMS.map(({ href, label }) => {
        const current = isCurrentSection(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={cx(
                "inline-flex min-h-11 min-w-11 items-center justify-center px-2 text-small font-medium underline-offset-8 transition-[color,text-decoration-color] hover:text-accent",
                current
                  ? "text-text underline decoration-accent decoration-2"
                  : "text-text-muted no-underline",
              )}
            >
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
