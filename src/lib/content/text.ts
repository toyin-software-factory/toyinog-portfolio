/**
 * Plain text helpers for HTML produced by `renderMarkdown()` (spec 0002).
 * That HTML never contains raw HTML from the author, so its structure is
 * predictable: block elements, inline elements and escaped text.
 */

const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*?(\/?)>/g;

/** Elements that never have a closing tag. */
const VOID_ELEMENTS = new Set(["br", "hr", "img", "input", "wbr"]);

const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

/** Turns `&amp;`, `&#39;` and `&#x27;` style references back into characters. */
export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, ref: string) => {
    if (ref.startsWith("#x") || ref.startsWith("#X")) {
      return String.fromCodePoint(Number.parseInt(ref.slice(2), 16));
    }
    if (ref.startsWith("#")) return String.fromCodePoint(Number.parseInt(ref.slice(1), 10));
    return NAMED_ENTITIES[ref.toLowerCase()] ?? match;
  });
}

/** The inner HTML of the first `<p>` that isn't nested in another element (so a blockquote note is skipped). */
function firstTopLevelParagraph(html: string): string | null {
  let depth = 0;
  let start = -1;
  for (const match of html.matchAll(TAG)) {
    const [whole, closing, rawName, selfClosing] = match;
    const name = (rawName ?? "").toLowerCase();
    if (VOID_ELEMENTS.has(name) || selfClosing) continue;
    if (closing) {
      depth -= 1;
      if (depth === 0 && name === "p" && start >= 0) return html.slice(start, match.index);
      continue;
    }
    if (depth === 0 && name === "p") start = match.index + whole.length;
    depth += 1;
  }
  return null;
}

/**
 * Shortens text to at most `max` characters, cutting at a word boundary and
 * ending with an ellipsis. Text that already fits comes back unchanged.
 */
export function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text;
  const room = text.slice(0, Math.max(0, max - 1));
  const lastSpace = room.lastIndexOf(" ");
  const cut = lastSpace > 0 ? room.slice(0, lastSpace) : room;
  return `${cut.replace(/[\s,;:.!?\-–—]+$/u, "")}…`;
}

/**
 * The first top level paragraph of rendered Markdown as plain text, at most
 * `max` characters (cut at a word boundary with an ellipsis). Used for the
 * Home About teaser (spec 0004). Returns an empty string when there is none.
 */
export function firstParagraphText(html: string, max: number): string {
  const paragraph = firstTopLevelParagraph(html);
  if (paragraph === null) return "";
  const text = decodeEntities(paragraph.replace(TAG, "")).replace(/\s+/g, " ").trim();
  return truncateAtWord(text, max);
}
