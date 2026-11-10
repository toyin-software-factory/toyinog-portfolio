import type { ContactState } from "@/lib/contact/handle";

/** Form level messages for the states that aren't field errors (spec 0007). */
export const formMessage = (state: ContactState, email: string): string | null => {
  switch (state.status) {
    case "turnstile":
      return "We couldn't confirm you're human. Please try again.";
    case "rate_limited":
      return "Too many messages in a short time. Please wait a minute and try again.";
    case "send_failed":
      return `Sorry, something went wrong sending your message. Please email me directly at ${email}.`;
    case "idle":
    case "invalid":
      return null;
  }
};
