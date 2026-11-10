/**
 * Structured contact logs (Workers Logs). The fields are typed so no name, email or
 * message text can be logged (spec 0007, AC-12): only the type, a length and codes.
 */
export type ContactLogEvent =
  | { readonly event: "contact.honeypot" }
  | { readonly event: "contact.invalid"; readonly fields: readonly string[] }
  | { readonly event: "contact.turnstile_failed"; readonly reason: string }
  | { readonly event: "contact.rate_limited" }
  | { readonly event: "contact.dry_run"; readonly type: string; readonly messageLength: number }
  | { readonly event: "contact.sent"; readonly type: string }
  | { readonly event: "contact.send_failed"; readonly error: string }
  | { readonly event: "contact.config_missing"; readonly missing: readonly string[] };

export type ContactLogger = (entry: ContactLogEvent) => void;

const errorEvents = new Set(["contact.send_failed", "contact.config_missing"]);

export const logContact: ContactLogger = (entry) => {
  const line = JSON.stringify(entry);
  if (errorEvents.has(entry.event)) console.error(line);
  else console.log(line);
};
