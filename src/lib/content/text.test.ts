import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";
import { decodeEntities, firstParagraphText, truncateAtWord } from "./text";

describe("firstParagraphText", () => {
  it("returns the first paragraph as plain text, without inline markup", () => {
    const html = renderMarkdown(
      "I build **fast**, [accessible](https://example.com) sites.\n\nSecond paragraph.",
    );
    expect(firstParagraphText(html, 280)).toBe("I build fast, accessible sites.");
  });

  it("skips headings, lists and blockquotes before the first top level paragraph", () => {
    const html = renderMarkdown(
      "## Hello\n\n- a list item\n\n> **Note.** A quoted note.\n\nThe real first paragraph.",
    );
    expect(firstParagraphText(html, 280)).toBe("The real first paragraph.");
  });

  it("decodes escaped characters", () => {
    const html = renderMarkdown('Design & build: 1 < 2 > 0, "people" who don\'t wait.');
    expect(firstParagraphText(html, 280)).toBe(
      'Design & build: 1 < 2 > 0, "people" who don\'t wait.',
    );
  });

  it("joins soft line breaks into single spaces", () => {
    const html = renderMarkdown("One line\nand the next  line.");
    expect(firstParagraphText(html, 280)).toBe("One line and the next line.");
  });

  it("cuts long text at a word boundary with an ellipsis, within the limit", () => {
    const words = "Placeholder words repeat here ".repeat(20);
    const result = firstParagraphText(renderMarkdown(words), 280);
    expect(result.length).toBeLessThanOrEqual(280);
    expect(result.endsWith("…")).toBe(true);
    expect(words.startsWith(result.slice(0, -1))).toBe(true);
    expect(result.slice(0, -1)).not.toMatch(/\s$/);
  });

  it("returns an empty string when there is no paragraph", () => {
    expect(firstParagraphText(renderMarkdown("## Only a heading"), 280)).toBe("");
    expect(firstParagraphText("", 280)).toBe("");
  });
});

describe("truncateAtWord", () => {
  it("leaves text that fits unchanged", () => {
    expect(truncateAtWord("Short text.", 11)).toBe("Short text.");
  });

  it("drops a partial word and trailing punctuation before the ellipsis", () => {
    expect(truncateAtWord("Hello, wonderful world", 12)).toBe("Hello…");
  });

  it("hard cuts a single word longer than the limit", () => {
    expect(truncateAtWord("Supercalifragilistic", 6)).toBe("Super…");
  });
});

describe("decodeEntities", () => {
  it("decodes named, decimal and hex references and keeps unknown ones", () => {
    expect(decodeEntities("&amp; &#39; &#x27; &lt;b&gt; &copy;")).toBe("& ' ' <b> &copy;");
  });
});
