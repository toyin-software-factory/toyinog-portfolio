import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { imageSize } from "./imageSize";

const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const file = (relative: string) => new Uint8Array(readFileSync(path.join(REPO, relative)));
const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => Array.from(new TextEncoder().encode(text));
const u16le = (n: number) => [n & 0xff, (n >> 8) & 0xff];
const u24le = (n: number) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff];
const u16be = (n: number) => [(n >> 8) & 0xff, n & 0xff];
const u32be = (n: number) => [(n >>> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];

describe("imageSize (spec 0008 AC-3)", () => {
  it("reads PNG files from the repo", () => {
    expect(imageSize("default.png", file("public/og/default.png"))).toEqual({
      width: 1200,
      height: 630,
    });
    expect(imageSize("apple-icon.png", file("src/app/apple-icon.png"))).toEqual({
      width: 180,
      height: 180,
    });
  });

  it("reads the placeholder SVG covers from width and height", () => {
    expect(imageSize("design-system.svg", file("public/images/work/design-system.svg"))).toEqual({
      width: 1200,
      height: 750,
    });
  });

  it("falls back to the SVG viewBox", () => {
    const svg = new TextEncoder().encode(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000"></svg>',
    );
    expect(imageSize("a.svg", svg)).toEqual({ width: 1600, height: 1000 });
  });

  it("reads a JPEG start of frame after other segments", () => {
    const jpeg = bytes(
      0xff,
      0xd8,
      0xff,
      0xe0,
      ...u16be(4),
      0,
      0, // APP0, skipped
      0xff,
      0xc4,
      ...u16be(4),
      0,
      0, // DHT, not a frame
      0xff,
      0xc0,
      ...u16be(17),
      8,
      ...u16be(1000),
      ...u16be(1600),
      3,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    );
    expect(imageSize("a.jpg", jpeg)).toEqual({ width: 1600, height: 1000 });
  });

  it("reads WebP in its lossy, lossless and extended forms", () => {
    const head = (chunk: string) => [
      ...ascii("RIFF"),
      0,
      0,
      0,
      0,
      ...ascii("WEBP"),
      ...ascii(chunk),
      0,
      0,
      0,
      0,
    ];
    const vp8 = bytes(
      ...head("VP8 "),
      0,
      0,
      0,
      0x9d,
      0x01,
      0x2a,
      ...u16le(1600),
      ...u16le(1000),
      0,
      0,
    );
    const bits = (1600 - 1) | ((1000 - 1) << 14);
    const vp8l = bytes(
      ...head("VP8L"),
      0x2f,
      bits & 0xff,
      (bits >> 8) & 0xff,
      (bits >> 16) & 0xff,
      (bits >>> 24) & 0xff,
      0,
      0,
      0,
      0,
      0,
    );
    const vp8x = bytes(...head("VP8X"), 0, 0, 0, 0, ...u24le(1600 - 1), ...u24le(1000 - 1), 0, 0);
    for (const webp of [vp8, vp8l, vp8x]) {
      expect(imageSize("a.webp", webp)).toEqual({ width: 1600, height: 1000 });
    }
  });

  it("reads GIF and AVIF", () => {
    expect(imageSize("a.gif", bytes(...ascii("GIF89a"), ...u16le(320), ...u16le(200)))).toEqual({
      width: 320,
      height: 200,
    });
    const avif = bytes(
      ...u32be(20),
      ...ascii("ftyp"),
      ...u32be(20),
      ...ascii("ispe"),
      0,
      0,
      0,
      0,
      ...u32be(1600),
      ...u32be(1000),
    );
    expect(imageSize("a.avif", avif)).toEqual({ width: 1600, height: 1000 });
  });

  it("returns null when it can't tell", () => {
    expect(imageSize("a.png", bytes(1, 2, 3))).toBeNull();
    expect(imageSize("a.svg", new TextEncoder().encode("<svg></svg>"))).toBeNull();
    expect(imageSize("a.bmp", bytes(0x42, 0x4d))).toBeNull();
  });
});
