import { absoluteUrl } from "./site";

/**
 * schema.org JSON-LD builders (spec 0008 AC-4). Pure: callers pass content in,
 * so these never read files themselves.
 */

type PersonInput = {
  readonly name: string;
  readonly headline: string;
  readonly links: { readonly linkedin: string; readonly github: string };
  /** Site path of the About photo. */
  readonly photo: string;
};

type ProjectInput = {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly year: number;
  /** Site path of the cover. */
  readonly cover: string;
};

export type JsonLdObject = Readonly<Record<string, unknown>>;

const PERSON_ID = absoluteUrl("/#person");
const WEBSITE_ID = absoluteUrl("/#website");

/** Toyin as a schema.org Person. */
export function personJsonLd(person: PersonInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: person.name,
    jobTitle: person.headline,
    url: absoluteUrl("/"),
    image: absoluteUrl(person.photo),
    sameAs: [person.links.linkedin, person.links.github],
  };
}

/** The site as a schema.org WebSite, published by the Person. */
export function websiteJsonLd(name: string): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name,
    url: absoluteUrl("/"),
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
  };
}

/** A case study as a schema.org CreativeWork, authored by the Person. */
export function creativeWorkJsonLd(project: ProjectInput, author: PersonInput): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/work/${project.slug}`),
    image: absoluteUrl(project.cover),
    dateCreated: String(project.year),
    author: personJsonLd(author),
  };
}

/**
 * JSON for a `<script type="application/ld+json">`. `<` is escaped so content
 * can never close the script element early (spec 0008, security model).
 */
export function serializeJsonLd(data: JsonLdObject | readonly JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
