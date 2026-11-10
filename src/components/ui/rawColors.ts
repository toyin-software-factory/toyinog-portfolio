/** Matches a raw colour value: a hex literal, or rgb(), hsl(), oklch() and friends. */
const RAW_COLOUR =
  /(?<![\w&-])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb|color)\(/gi;

/** Returns every raw colour value in a source file's text. */
export const findRawColours = (source: string): readonly string[] =>
  Array.from(source.matchAll(RAW_COLOUR), (match) => match[0]);
