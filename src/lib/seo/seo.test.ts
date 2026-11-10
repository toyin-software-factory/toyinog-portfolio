import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

import { creativeWorkJsonLd, personJsonLd, serializeJsonLd, websiteJsonLd } from "./jsonLd";
import { pageMetadata } from "./metadata";
import { absoluteUrl, DEFAULT_SHARE_IMAGE, DESCRIPTION_MAX, SITE_NAME } from "./site";

const person = {
  name: "Ada Lovelace",
  headline: "Engineer",
  links: { linkedin: "https://example.com/in/ada", github: "https://example.com/ada" },
  photo: "/images/about/photo.svg",
};

describe("pageMetadata (spec 0008 AC-1 to AC-3)", () => {
  const description = "A description that is long enough to pass the fifty character check.";

  it("sets the canonical, Open Graph and Twitter tags with the default image", () => {
    const meta = pageMetadata({ title: "Work", description, path: "/work" });
    expect(meta.title).toBe("Work");
    expect(meta.alternates?.canonical).toBe("/work");
    expect(meta.openGraph).toMatchObject({
      title: `Work · ${SITE_NAME}`,
      description,
      url: "/work",
      type: "website",
      siteName: SITE_NAME,
      images: [{ ...DEFAULT_SHARE_IMAGE }],
    });
    expect(meta.twitter).toMatchObject({
      card: "summary_large_image",
      title: `Work · ${SITE_NAME}`,
    });
    expect(DEFAULT_SHARE_IMAGE).toMatchObject({ width: 1200, height: 630 });
  });

  it("uses an absolute title as is and a given image", () => {
    const meta = pageMetadata({
      title: "Home title",
      absoluteTitle: true,
      description,
      path: "/",
      image: { url: "/images/work/a.svg", alt: "Cover" },
      type: "article",
    });
    expect(meta.title).toEqual({ absolute: "Home title" });
    expect(meta.openGraph).toMatchObject({
      title: "Home title",
      type: "article",
      images: [{ url: "/images/work/a.svg", alt: "Cover" }],
    });
  });

  it("collapses whitespace and caps the description at 160 characters", () => {
    const long = `${"word ".repeat(60)}\n end`;
    const meta = pageMetadata({ title: "X", description: long, path: "/x" });
    expect(meta.description?.length ?? 0).toBeLessThanOrEqual(DESCRIPTION_MAX);
    expect(meta.description).not.toMatch(/\s{2}|\n/);
    expect(meta.description?.endsWith("…")).toBe(true);
  });
});

describe("JSON-LD (spec 0008 AC-4)", () => {
  it("describes the Person with job title, links and photo", () => {
    expect(personJsonLd(person)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": absoluteUrl("/#person"),
      name: "Ada Lovelace",
      jobTitle: "Engineer",
      url: absoluteUrl("/"),
      image: absoluteUrl("/images/about/photo.svg"),
      sameAs: [person.links.linkedin, person.links.github],
    });
  });

  it("describes the WebSite, published by the Person", () => {
    expect(websiteJsonLd("Ada Lovelace")).toMatchObject({
      "@type": "WebSite",
      url: "https://toyinog.com/",
      publisher: { "@id": absoluteUrl("/#person") },
    });
  });

  it("describes a case study as a CreativeWork by the Person", () => {
    const work = creativeWorkJsonLd(
      {
        slug: "ledger",
        title: "Ledger",
        summary: "Faster reconciling.",
        year: 2025,
        cover: "/c.png",
      },
      person,
    );
    expect(work).toMatchObject({
      "@type": "CreativeWork",
      name: "Ledger",
      description: "Faster reconciling.",
      url: "https://toyinog.com/work/ledger",
      image: "https://toyinog.com/c.png",
      dateCreated: "2025",
      author: { "@type": "Person", name: "Ada Lovelace" },
    });
  });

  it("escapes < so content can't close the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(out).not.toContain("<");
    expect(JSON.parse(out)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("robots.txt by environment (spec 0008 AC-5)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows everything and points at the sitemap in production", () => {
    vi.stubEnv("APP_ENV", "production");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://toyinog.com/sitemap.xml",
    });
  });

  it("disallows everything in previews", () => {
    vi.stubEnv("APP_ENV", "preview");
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });
});

describe("sitemap (spec 0008 AC-6)", () => {
  it("lists the public pages with a lastModified date, and not the private ones", () => {
    const entries = sitemap();
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    expect(paths).toEqual(expect.arrayContaining(["/", "/work", "/about", "/contact"]));
    expect(paths).not.toContain("/contact/sent");
    expect(paths).not.toContain("/styleguide");
    for (const entry of entries) expect(entry.lastModified).toBeInstanceOf(Date);
  });
});
