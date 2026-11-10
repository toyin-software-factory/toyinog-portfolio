import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { getAbout, getFeaturedProjects, getProfile, firstParagraphText } from "@/lib/content";
import { SHELL_PROFILE } from "@/lib/content/generated/shell-profile";
import { personJsonLd, websiteJsonLd } from "@/lib/seo/jsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

import { AboutTeaser } from "./_home/AboutTeaser";
import { ContactCta } from "./_home/ContactCta";
import { ABOUT_TEASER_MAX } from "./_home/copy";
import { Hero } from "./_home/Hero";
import { SelectedWork } from "./_home/SelectedWork";

export const dynamic = "force-static";

/** "<name> · <headline>" as is (not through the template), with the intro as description. */
export const metadata: Metadata = pageMetadata({
  title: `${SHELL_PROFILE.name} · ${SHELL_PROFILE.headline}`,
  absoluteTitle: true,
  description: SHELL_PROFILE.intro,
  path: "/",
});

/** Home (spec 0004): hero, Selected work, About teaser and the contact call to action. */
export default function HomePage() {
  const profile = getProfile();
  const about = getAbout();

  const person = personJsonLd({ ...profile, photo: about.photo.src });

  return (
    <>
      <JsonLd data={[websiteJsonLd(profile.name), person]} />
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
