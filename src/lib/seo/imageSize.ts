/**
 * Reads an image's pixel size from its file header, for `og:image:width` and
 * `og:image:height` on case study covers (spec 0008 AC-3). Covers the formats
 * content allows (spec 0002): PNG, JPEG, WebP, GIF, AVIF and SVG. Pure: the
 * caller reads the file (at build time only). Returns null when the size can't
 * be told, so the tags are left out rather than guessed.
 */

export type ImageSize = { readonly width: number; readonly height: number };

const valid = (width: number, height: number): ImageSize | null =>
  Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0
    ? { width: Math.round(width), height: Math.round(height) }
    : null;

function png(bytes: Uint8Array, view: DataView): ImageSize | null {
  // Signature, then the IHDR chunk: width and height as big endian 32 bit numbers.
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) return null;
  return valid(view.getUint32(16), view.getUint32(20));
}

function gif(bytes: Uint8Array, view: DataView): ImageSize | null {
  if (bytes.length < 10 || bytes[0] !== 0x47 || bytes[1] !== 0x49) return null;
  return valid(view.getUint16(6, true), view.getUint16(8, true));
}

function jpeg(bytes: Uint8Array, view: DataView): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return null;
    const marker = bytes[offset + 1] ?? 0;
    const length = view.getUint16(offset + 2);
    // Start of frame markers carry the size; skip DHT (C4), JPG (C8) and DAC (CC).
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return valid(view.getUint16(offset + 7), view.getUint16(offset + 5));
    }
    offset += 2 + length;
  }
  return null;
}

function webp(bytes: Uint8Array, view: DataView): ImageSize | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes.length < 30 || ascii(0, 4) !== "RIFF" || ascii(8, 12) !== "WEBP") return null;
  const chunk = ascii(12, 16);
  if (chunk === "VP8 ")
    return valid(view.getUint16(26, true) & 0x3fff, view.getUint16(28, true) & 0x3fff);
  if (chunk === "VP8L") {
    const bits = view.getUint32(21, true);
    return valid((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
  }
  if (chunk === "VP8X") {
    const read24 = (at: number) =>
      (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8) | ((bytes[at + 2] ?? 0) << 16);
    return valid(read24(24) + 1, read24(27) + 1);
  }
  return null;
}

function avif(bytes: Uint8Array, view: DataView): ImageSize | null {
  // The 'ispe' box: size, type, version and flags, then width and height.
  for (let at = 4; at + 16 <= bytes.length; at += 1) {
    if (
      bytes[at] === 0x69 &&
      bytes[at + 1] === 0x73 &&
      bytes[at + 2] === 0x70 &&
      bytes[at + 3] === 0x65
    ) {
      return valid(view.getUint32(at + 8), view.getUint32(at + 12));
    }
  }
  return null;
}

function svg(text: string): ImageSize | null {
  const root = /<svg\b[^>]*>/i.exec(text)?.[0];
  if (!root) return null;
  const attribute = (name: string) =>
    new RegExp(`\\s${name}\\s*=\\s*["']\\s*([\\d.]+)(px)?\\s*["']`, "i").exec(root)?.[1];
  const width = attribute("width");
  const height = attribute("height");
  if (width && height) return valid(Number(width), Number(height));
  const box =
    /\sviewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i.exec(root);
  return box ? valid(Number(box[1]), Number(box[2])) : null;
}

/** The pixel size of an image file's contents, or null. `fileName` picks the format. */
export function imageSize(fileName: string, bytes: Uint8Array): ImageSize | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const extension = /\.([a-z0-9]+)$/i.exec(fileName)?.[1]?.toLowerCase();
  switch (extension) {
    case "png":
      return png(bytes, view);
    case "gif":
      return gif(bytes, view);
    case "jpg":
    case "jpeg":
      return jpeg(bytes, view);
    case "webp":
      return webp(bytes, view);
    case "avif":
      return avif(bytes, view);
    case "svg":
      return svg(new TextDecoder().decode(bytes));
    default:
      return null;
  }
}
