import type { Metadata } from "next";

import { Container, Heading, Section } from "@/components/ui";
import { firstParagraphText, getAbout } from "@/lib/content";

import { CvDownload } from "./_components/CvDownload";
import { ExperienceList } from "./_components/ExperienceList";
import { Intro } from "./_components/Intro";
import { SkillGroups } from "./_components/SkillGroups";
import { ABOUT_DESCRIPTION_MAX } from "./copy";

export const dynamic = "force-static";

/** Title through the root template, and the bio's first paragraph as the description (AC-6). */
export function generateMetadata(): Metadata {
  return {
    title: "About",
    description: firstParagraphText(getAbout().bioHtml, ABOUT_DESCRIPTION_MAX),
    alternates: { canonical: "/about" },
  };
}

/** Photo and bio, experience, skills and the CV (spec 0006). Static, built from content/. */
export default function AboutPage() {
  const about = getAbout();
  const cv = <CvDownload file={about.cv.file} updated={about.cv.updated} />;

  return (
    <Container className="flex flex-col py-16 md:py-24">
      <Heading level={1} className="mb-10 md:mb-14">
        About
      </Heading>
      <Intro photo={about.photo} bioHtml={about.bioHtml}>
        {cv}
      </Intro>
      <Section rule aria-labelledby="experience-title" className="mt-16 md:mt-24">
        <Heading level={2} id="experience-title" className="mb-8">
          Experience
        </Heading>
        <ExperienceList entries={about.experience} />
      </Section>
      <Section rule aria-labelledby="skills-title">
        <Heading level={2} id="skills-title" className="mb-8">
          Skills
        </Heading>
        <SkillGroups groups={about.skillGroups} />
      </Section>
      <div className="border-t border-rule pt-10">{cv}</div>
    </Container>
  );
}
