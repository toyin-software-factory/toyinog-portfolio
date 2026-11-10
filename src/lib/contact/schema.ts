import { z } from "zod";

import { CONTACT_FIELDS, type ContactField, CONTACT_TYPES, HONEYPOT_FIELD } from "./fields";

// Server code keeps importing these from here.
export {
  CONTACT_FIELDS,
  type ContactField,
  CONTACT_TYPE_LABELS,
  CONTACT_TYPES,
  type ContactType,
  HONEYPOT_FIELD,
} from "./fields";

const LINE_BREAK = /[\r\n]/;

/**
 * The one source of truth for valid input (spec 0007, AC-2 and AC-3). The server
 * always runs it; the browser's own checks are only a convenience.
 */
export const contactSchema = z.object({
  name: z
    .string({ error: "Enter your name." })
    .trim()
    .min(1, { error: "Enter your name." })
    .max(100, { error: "Your name must be 100 characters or fewer." })
    // No CR or LF: the name goes into the email subject, so this blocks header injection.
    .refine((value) => !LINE_BREAK.test(value), { error: "Your name can't contain line breaks." }),
  email: z
    .string({ error: "Enter your email address." })
    .trim()
    .min(1, { error: "Enter your email address." })
    .max(254, { error: "Your email address must be 254 characters or fewer." })
    .pipe(z.email({ error: "Enter an email address like name@example.com." })),
  type: z.enum(CONTACT_TYPES, { error: "Choose what this is about." }),
  message: z
    .string({ error: "Enter a message." })
    .trim()
    .min(1, { error: "Enter a message." })
    .min(20, { error: "Your message needs at least 20 characters." })
    .max(5000, { error: "Your message must be 5000 characters or fewer." }),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** What the visitor typed, kept as strings so the form can show it again. */
export type ContactValues = Readonly<Record<ContactField, string>>;
export type ContactErrors = Readonly<Partial<Record<ContactField, string>>>;

const text = (formData: FormData, key: string): string => {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
};

/** Reads the submitted form into plain strings. */
export const readContactValues = (formData: FormData): ContactValues => ({
  name: text(formData, "name"),
  email: text(formData, "email"),
  type: text(formData, "type"),
  message: text(formData, "message"),
});

export const isHoneypotFilled = (formData: FormData): boolean =>
  text(formData, HONEYPOT_FIELD).trim() !== "";

export type ParseResult =
  | { readonly ok: true; readonly data: ContactInput }
  | { readonly ok: false; readonly errors: ContactErrors };

/** Validates the values, returning the first error for each field. */
export const parseContact = (values: ContactValues): ParseResult => {
  const result = contactSchema.safeParse({
    ...values,
    // An empty radio group submits nothing; treat it as missing, not as "".
    type: values.type === "" ? undefined : values.type,
  });
  if (result.success) return { ok: true, data: result.data };

  const errors: Partial<Record<ContactField, string>> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && (CONTACT_FIELDS as readonly string[]).includes(field)) {
      errors[field as ContactField] ??= issue.message;
    }
  }
  return { ok: false, errors };
};
