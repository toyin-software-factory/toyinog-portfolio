import type { Metadata } from "next";

import { getAbout, getFeaturedProjects, getProfile, firstParagraphText } from "@/lib/content";

import { AboutTeaser } from "./_home/AboutTeaser";
import { ContactCta } from "./_home/ContactCta";
import { ABOUT_TEASER_MAX } from "./_home/copy";
import { Hero } from "./_home/Hero";
import { SelectedWork } from "./_home/SelectedWork";

export const dynamic = "force-static";

// No title here: Home uses the layout's default title, "<name> · <headline>".
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** Home (spec 0004): hero, Selected work, About teaser and the contact call to action. */
export default function HomePage() {
  const profile = getProfile();
  const about = getAbout();

  return (
    <>
      <Hero profile={profile} />
      <SelectedWork projects={getFeaturedProjects()} />
      <AboutTeaser
        teaser={firstParagraphText(about.bioHtml, ABOUT_TEASER_MAX)}
        latest={about.experience[0]}
      />
      <ContactCta />
    </>
  );
}
