import type { Availability } from "@/lib/content";

/** The one line intro, from the profile's availability (spec 0007, AC-1). */
export const contactIntro = (availability: Availability): string => {
  switch (availability) {
    case "roles":
      return "I'm open to new roles. Tell me about the team and the work.";
    case "projects":
      return "I'm taking on new projects. Tell me what you're building.";
    case "both":
      return "I'm open to new roles and taking on projects. Tell me what you have in mind.";
    case "none":
      return "I'm not taking on new work right now, but I read every message.";
  }
};
