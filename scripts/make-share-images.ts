/**
 * Makes the static share image and the Apple touch icon (spec 0008 AC-3, AC-7):
 *   public/og/default.png   1200 x 630, Carbon Black with Toyin's name and headline
 *   src/app/apple-icon.png  180 x 180, a lemon "T" on Carbon Black
 *
 * Run after a build, whenever the name or headline changes, and commit the PNGs:
 *   pnpm build && pnpm exec tsx scripts/make-share-images.ts
 *
 * Fonts are the self hosted Instrument Serif and Inter files from that build
 * (next/font), inlined as data URLs, so rendering needs no network. Colours are
 * the design tokens from src/app/globals.css (design.md).
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

import { loadContent } from "../src/lib/content/load";
import { getAppEnv } from "../src/lib/env";

const ROOT = process.cwd();
const CSS_DIR = path.join(ROOT, ".next/static/chunks");
const MEDIA_DIR = path.join(ROOT, ".next/static/media");

const TOKENS = {
  bg: "#202020",
  text: "#d6d6d6",
  muted: "#a3a3a3",
  accent: "#ffee32",
  onAccent: "#202020",
} as const;

const escapeHtml = (text: string) =>
  text.replace(/[&<>"]/g, (char) => `&#${String(char.charCodeAt(0))};`);

/** The build's @font-face rules for Instrument Serif and Inter, with the files inlined. */
function fontFaces(): string {
  const css = readdirSync(CSS_DIR)
    .filter((name) => name.endsWith(".css"))
    .map((name) => readFileSync(path.join(CSS_DIR, name), "utf8"))
    .join("\n");
  const faces = [...css.matchAll(/@font-face\{[^}]*\}/g)]
    .map(([face]) => face)
    .filter(
      (face) => /font-family:(Instrument Serif|Inter)[;,]/.test(face) && face.includes("url("),
    );
  if (faces.length === 0) throw new Error("No built fonts found. Run `pnpm build` first.");
  return faces
    .map((face) =>
      face.replace(/url\(\.\.\/media\/([^)]+)\)/g, (_match, file: string) => {
        const data = readFileSync(path.join(MEDIA_DIR, file)).toString("base64");
        return `url(data:font/woff2;base64,${data})`;
      }),
    )
    .join("\n");
}

function page(body: string, width: number, height: number): string {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFaces()}
* { box-sizing: border-box; margin: 0; }
html, body { width: ${String(width)}px; height: ${String(height)}px; background: ${TOKENS.bg}; }
body { font-family: Inter, sans-serif; color: ${TOKENS.text}; overflow: hidden; }
</style></head><body>${body}</body></html>`;
}

function shareCard(name: string, headline: string): string {
  return page(
    `<div style="height:100%;display:flex;flex-direction:column;justify-content:space-between;padding:72px 80px;border-left:16px solid ${TOKENS.accent}">
      <p style="font-size:24px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:${TOKENS.muted}">toyinog.com</p>
      <div>
        <h1 style="font-family:'Instrument Serif',serif;font-weight:400;font-size:128px;line-height:1.02;letter-spacing:-0.01em">${escapeHtml(name)}</h1>
        <p style="margin-top:28px;max-width:960px;font-size:36px;line-height:1.35;color:${TOKENS.muted}">${escapeHtml(headline)}</p>
      </div>
    </div>`,
    1200,
    630,
  );
}

function appleIcon(): string {
  return page(
    `<div style="height:100%;display:flex;align-items:center;justify-content:center">
      <span style="font-family:'Instrument Serif',serif;font-size:168px;line-height:1;color:${TOKENS.accent};transform:translateY(8px)">T</span>
    </div>`,
    180,
    180,
  );
}

async function render(html: string, width: number, height: number, out: string) {
  const browser = await chromium.launch();
  try {
    const tab = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await tab.setContent(html);
    await tab.evaluate(() => document.fonts.ready);
    await tab.screenshot({ path: path.join(ROOT, out), type: "png" });
    console.log(`Wrote ${out} (${String(width)} x ${String(height)})`);
  } finally {
    await browser.close();
  }
}

const { profile } = loadContent({
  rootDir: ROOT,
  appEnv: getAppEnv(),
  currentYear: new Date().getFullYear(),
});
await render(shareCard(profile.name, profile.headline), 1200, 630, "public/og/default.png");
await render(appleIcon(), 180, 180, "src/app/apple-icon.png");
