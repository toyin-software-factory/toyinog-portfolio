import type { Element, Root, RootContent } from "hast";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { SITE_URL } from "@/lib/site";

/** Link and image protocols allowed in rendered Markdown. Relative URLs and `#anchors` are always fine. */
const SAFE_PROTOCOLS = new Set(["http:", "https:", "mailto:"]);
const URL_ATTRIBUTES = ["href", "src"] as const;

function isSafeUrl(value: string): boolean {
  // Browsers ignore control characters and whitespace in a scheme, so strip them before checking.
  const cleaned = value.replace(/[\u0000- \u007f]/g, "");
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(cleaned);
  if (!scheme?.[1]) return true;
  return SAFE_PROTOCOLS.has(`${scheme[1].toLowerCase()}:`);
}

function isElement(node: RootContent): node is Element {
  return node.type === "element";
}

/** Drops `javascript:` and other unsafe URLs that Markdown links and images could carry. */
function stripUnsafeUrls(node: Root | Element): void {
  for (const child of node.children) {
    if (!isElement(child)) continue;
    for (const attribute of URL_ATTRIBUTES) {
      const value = child.properties[attribute];
      if (typeof value === "string" && !isSafeUrl(value)) {
        child.properties[attribute] = undefined;
      }
    }
    stripUnsafeUrls(child);
  }
}

function rehypeSafeUrls() {
  return (tree: Root) => {
    stripUnsafeUrls(tree);
  };
}

function isExternalLink(element: Element): boolean {
  const href = element.properties.href;
  if (typeof href !== "string" || !/^https?:\/\//i.test(href)) return false;
  try {
    return new URL(href).origin !== new URL(SITE_URL).origin;
  } catch {
    // Unparseable absolute URL: treat it as external so it still gets the safe rel.
    return true;
  }
}

/**
 * Markdown to HTML for case study bodies and the About bio.
 * Raw HTML in the Markdown is dropped (remark-rehype runs without `allowDangerousHtml`),
 * headings get ids, and external links get `rel="noopener noreferrer"`.
 */
const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSafeUrls)
  .use(rehypeSlug)
  .use(rehypeExternalLinks, { rel: ["noopener", "noreferrer"], test: isExternalLink })
  .use(rehypeStringify);

export function renderMarkdown(markdown: string): string {
  return String(processor.processSync(markdown));
}
