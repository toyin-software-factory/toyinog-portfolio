import type { Availability } from "@/lib/content";

/**
 * Fixed Home copy (spec 0004). Kept in code rather than content: changing it is
 * a small code PR. Everything else on Home comes from content/ (spec 0002).
 */

/** The contact call to action heading. */
export const CONTACT_CTA_HEADING = "Have a role or a project in mind?";

/** Availability badge text. `null` hides the badge. */
export const AVAILABILITY_BADGE: Readonly<Record<Availability, string | null>> = {
  roles: "Open to new roles",
  projects: "Available for projects",
  both: "Open to roles and projects",
  none: null,
};

/** Longest About teaser, in characters (spec 0004, AC-7). */
export const ABOUT_TEASER_MAX = 280;

/** Most tags shown on a Selected work card (spec 0004, AC-6). */
export const MAX_CARD_TAGS = 3;
