import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getAbout } from "@/lib/content";
import { formatMonthRange } from "@/lib/format/date";

import { CvDownload } from "./_components/CvDownload";
import { ExperienceList } from "./_components/ExperienceList";
import AboutPage, { dynamic, generateMetadata } from "./page";

describe("AboutPage (spec 0006)", () => {
  it("has one h1 and an h2 for Experience and Skills (AC-1, AC-3, AC-4)", () => {
    render(<AboutPage />);
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([
      "About",
    ]);
    const h2s = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(h2s).toContain("Experience");
    expect(h2s).toContain("Skills");
  });

  it("shows the photo with alt text and explicit size (AC-1)", () => {
    render(<AboutPage />);
    const photo = screen.getByRole("img", { name: getAbout().photo.alt });
    expect(photo).toHaveAttribute("width", "800");
    expect(photo).toHaveAttribute("height", "1000");
  });

  it("lists every role newest first, each with an h3 and highlights (AC-3)", () => {
    render(<AboutPage />);
    const { experience } = getAbout();
    const list = within(screen.getByRole("region", { name: "Experience" })).getAllByRole("list")[0];
    if (!list) throw new Error("no experience list");
    expect(list.tagName).toBe("OL");
    const roles = within(list)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(roles).toEqual(experience.map((entry) => entry.role));
  });

  it("shows each skill group as an h3 with its skills as tags (AC-4)", () => {
    render(<AboutPage />);
    for (const group of getAbout().skillGroups) {
      expect(screen.getByRole("heading", { level: 3, name: group.name })).toBeInTheDocument();
      const tags = within(screen.getByRole("list", { name: group.name })).getAllByRole("listitem");
      expect(tags.map((tag) => tag.textContent)).toEqual(group.skills);
    }
  });

  it("offers the CV twice: after the bio and at the end (AC-5)", () => {
    render(<AboutPage />);
    const links = screen.getAllByRole("link", { name: /Download CV/ });
    expect(links).toHaveLength(2);
    for (const link of links) expect(link).toHaveAttribute("href", getAbout().cv.file);
  });

  it("is static, titled About, with a description of at most 160 characters (AC-6)", () => {
    expect(dynamic).toBe("force-static");
    const meta = generateMetadata();
    expect(meta.title).toBe("About");
    expect(typeof meta.description).toBe("string");
    expect(meta.description?.length ?? 0).toBeGreaterThan(0);
    expect(meta.description?.length ?? 0).toBeLessThanOrEqual(160);
  });
});

describe("ExperienceList (AC-3)", () => {
  const entries = [
    {
      role: "Lead engineer",
      company: "Acme",
      location: "Remote",
      start: "2024-03",
      end: "present" as const,
      highlights: ["One", "Two"],
    },
    {
      role: "Engineer",
      company: "Beta",
      start: "2019-01",
      end: "2022-02",
      highlights: ["Three", "Four"],
    },
  ];

  it("writes date ranges with machine readable times", () => {
    const { container } = render(<ExperienceList entries={entries} />);
    expect(container).toHaveTextContent(formatMonthRange("2024-03", "present"));
    expect(container).toHaveTextContent("Jan 2019 to Feb 2022");
    const times = [...container.querySelectorAll("time")].map((time) =>
      time.getAttribute("datetime"),
    );
    expect(times).toEqual(["2024-03", "2019-01", "2022-02"]);
  });

  it("shows the location only when set", () => {
    render(<ExperienceList entries={entries} />);
    expect(screen.getByText("Acme · Remote")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});

describe("CvDownload (AC-5)", () => {
  it("downloads under a fixed name, says PDF, and shows the updated month", () => {
    render(<CvDownload file="/cv/anything.pdf" updated="2026-11" />);
    const link = screen.getByRole("link", { name: /PDF/ });
    expect(link).toHaveAttribute("href", "/cv/anything.pdf");
    expect(link).toHaveAttribute("download", "Toyin-Ogunseinde-CV.pdf");
    expect(screen.getByText(/Last updated/)).toHaveTextContent("Last updated November 2026");
    expect(screen.getByText("November 2026")).toHaveAttribute("datetime", "2026-11");
  });
});
