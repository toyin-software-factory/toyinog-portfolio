import { describe, expect, it } from "vitest";

import { renderMarkdown } from "./markdown";

describe("renderMarkdown (AC-7)", () => {
  it("gives headings ids", () => {
    expect(renderMarkdown("## What I did\n\n### Step one")).toBe(
      '<h2 id="what-i-did">What I did</h2>\n<h3 id="step-one">Step one</h3>',
    );
  });

  it("marks external links noopener noreferrer, and leaves internal links alone", () => {
    const html = renderMarkdown(
      "[out](https://example.com) [home](/work) [abs](https://toyinog.com/about) [top](#top)",
    );

    expect(html).toContain('<a href="https://example.com" rel="noopener noreferrer">out</a>');
    expect(html).toContain('<a href="/work">home</a>');
    expect(html).toContain('<a href="https://toyinog.com/about">abs</a>');
    expect(html).toContain('<a href="#top">top</a>');
  });

  it("drops raw HTML, so Markdown can't inject scripts", () => {
    const html = renderMarkdown(
      'Hello <script>alert(1)</script> world\n\n<div onclick="alert(1)">block</div>\n\n<img src=x onerror=alert(1)>',
    );

    expect(html).not.toMatch(/<script|<div|<img|onclick|onerror/i);
    expect(html).toContain("Hello");
  });

  it("removes javascript: and other unsafe URLs, keeping safe ones", () => {
    const html = renderMarkdown(
      "[a](javascript:alert(1)) [b](JaVaScRiPt:alert(1)) [c](data:text/html,x) [d](mailto:a@example.com) ![e](vbscript:x)",
    );

    expect(html).not.toMatch(/javascript:|data:|vbscript:/i);
    expect(html).toContain('<a href="mailto:a@example.com">d</a>');
  });

  it("renders common Markdown", () => {
    expect(renderMarkdown("**bold** _em_\n\n- one\n- two")).toBe(
      "<p><strong>bold</strong> <em>em</em></p>\n<ul>\n<li>one</li>\n<li>two</li>\n</ul>",
    );
  });
});
