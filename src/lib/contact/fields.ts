/**
 * The contact form's field names, type options and labels (spec 0007). Plain values with
 * no imports, so client components can use them without pulling zod into the browser:
 * zod 4 probes `Function("")` on first use, which the CSP blocks as eval (spec 0009 AC-4).
 * `noZodInClient.test.ts` keeps it that way.
 */

/** The form's fields, in display order. */
export const CONTACT_FIELDS = ["name", "email", "type", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export const CONTACT_TYPES = ["hiring", "project"] as const;
export type ContactType = (typeof CONTACT_TYPES)[number];

export const CONTACT_TYPE_LABELS: Readonly<Record<ContactType, string>> = {
  hiring: "A role (hiring)",
  project: "A project",
};

/** The honeypot field. Real visitors never see or fill it. */
export const HONEYPOT_FIELD = "website";
