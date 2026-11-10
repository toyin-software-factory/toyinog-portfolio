import { createMimeMessage, Mailbox } from "mimetext";

import { CONTACT_TYPE_LABELS, type ContactInput } from "./schema";

export const SENDER_NAME = "toyinog.com contact";

const subjectPrefix = { hiring: "Hiring", project: "Project" } as const;

/** "[toyinog.com] Hiring: Ada Lovelace" (spec 0007, AC-7). */
export const contactSubject = (input: Pick<ContactInput, "type" | "name">): string =>
  `[toyinog.com] ${subjectPrefix[input.type]}: ${input.name}`;

/** The plain text body: name, email, type, message and the UTC send time. */
export const contactBody = (input: ContactInput, sentAt: Date): string =>
  [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `About: ${CONTACT_TYPE_LABELS[input.type]}`,
    `Sent: ${sentAt.toISOString()} (UTC)`,
    "",
    input.message,
    "",
  ].join("\n");

type BuildOptions = {
  readonly from: string;
  readonly to: string;
  readonly input: ContactInput;
  readonly sentAt: Date;
};

/**
 * Builds the raw MIME email. The schema already keeps CR and LF out of the name and
 * email, and mimetext encodes header values, so headers can't be injected.
 */
export function buildContactEmail({ from, to, input, sentAt }: BuildOptions): string {
  const message = createMimeMessage();
  message.setSender({ name: SENDER_NAME, addr: from });
  message.setRecipient(to);
  message.setHeader("Reply-To", new Mailbox(input.email));
  message.setSubject(contactSubject(input));
  message.addMessage({ contentType: "text/plain", data: contactBody(input, sentAt) });
  return message.asRaw();
}
