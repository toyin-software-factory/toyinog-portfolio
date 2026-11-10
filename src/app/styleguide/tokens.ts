/** What the styleguide shows for each token. Values live in globals.css, not here. */

export type ColourToken = {
  readonly token: string;
  readonly name: string;
  readonly use: string;
  readonly contrast?: string;
  /** The utility that paints the swatch with this token. */
  readonly swatch: string;
};

export const colourTokens: readonly ColourToken[] = [
  { token: "bg", name: "Carbon Black", use: "Page background", swatch: "bg-bg" },
  {
    token: "surface",
    name: "Graphite",
    use: "Cards, tags, code, raised areas",
    swatch: "bg-surface",
  },
  { token: "rule", name: "Graphite", use: "Dividers (decorative)", swatch: "bg-rule" },
  {
    token: "text",
    name: "Dust Grey",
    use: "Body text and headings",
    contrast: "11.2:1 on bg · 8.6:1 on surface",
    swatch: "bg-text",
  },
  {
    token: "text-muted",
    name: "Muted grey",
    use: "Metadata, captions, secondary text",
    contrast: "6.5:1 on bg · 5.0:1 on surface",
    swatch: "bg-text-muted",
  },
  {
    token: "accent",
    name: "Bright Lemon",
    use: "Links, focus ring, badge, primary button",
    contrast: "13.6:1 on bg",
    swatch: "bg-accent",
  },
  {
    token: "accent-strong",
    name: "Bright Amber",
    use: "Hover and pressed for accent things",
    contrast: "11.1:1 on bg",
    swatch: "bg-accent-strong",
  },
  {
    token: "on-accent",
    name: "Carbon Black",
    use: "Text on lemon or amber fills",
    contrast: "13.6:1 on accent",
    swatch: "bg-on-accent",
  },
  {
    token: "border-control",
    name: "Control grey",
    use: "Input and outline button borders",
    contrast: "4.7:1 on bg (3:1 needed)",
    swatch: "bg-border-control",
  },
  {
    token: "danger",
    name: "Error red",
    use: "Form errors",
    contrast: "7.1:1 on bg",
    swatch: "bg-danger",
  },
];

export type TypeToken = {
  readonly token: string;
  readonly spec: string;
  readonly className: string;
  readonly sample: string;
};

export const typeTokens: readonly TypeToken[] = [
  {
    token: "display",
    spec: "Instrument Serif · 3 to 5.5rem",
    className: "font-display text-display",
    sample: "Design that ships",
  },
  {
    token: "h1",
    spec: "Instrument Serif · 2.5 to 3.5rem",
    className: "font-display text-h1",
    sample: "Selected work",
  },
  {
    token: "h2",
    spec: "Instrument Serif · 1.75 to 2.25rem",
    className: "font-display text-h2",
    sample: "A calmer checkout",
  },
  {
    token: "h3",
    spec: "Inter semibold · 1.25rem",
    className: "font-sans text-h3",
    sample: "What I changed",
  },
  {
    token: "body",
    spec: "Inter · 1.0625rem · line height 1.7",
    className: "font-sans text-body",
    sample:
      "I design and build products that are clear, fast and accessible, from the first sketch to the last pull request.",
  },
  {
    token: "small",
    spec: "Inter · 0.875rem",
    className: "font-sans text-small",
    sample: "Updated November 2026",
  },
  {
    token: "label",
    spec: "Inter medium · 0.75rem · uppercase · 0.08em",
    className: "font-sans text-label uppercase",
    sample: "Case study",
  },
];
