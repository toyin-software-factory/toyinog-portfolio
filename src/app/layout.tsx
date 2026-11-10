import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { Analytics } from "@/components/site/Analytics";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SkipLink } from "@/components/ui";
import { BUILD_YEAR, SHELL_PROFILE } from "@/lib/content/generated/shell-profile";
import { getAppEnv } from "@/lib/env";
import { isIndexable } from "@/lib/seo/indexing";
import { DEFAULT_SHARE_IMAGE } from "@/lib/seo/site";
import { SITE_URL } from "@/lib/site";

import "./globals.css";

// Self hosted by next/font at build time: no request to a font host at runtime.
const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-instrument-serif",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const { name, headline, intro } = SHELL_PROFILE;

/**
 * Root metadata from the profile (spec 0004, AC-10). Pages set only their own part of the title.
 * Values come from the build time module, never the file loader, so this also works on
 * routes rendered at request time on Workers (AC-12).
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: `%s · ${name}`, default: `${name} · ${headline}` },
  description: intro,
  // Defaults for pages without their own (the 404 page, for example). Public pages
  // set their full set through pageMetadata() in src/lib/seo (spec 0008).
  openGraph: {
    siteName: name,
    type: "website",
    locale: "en",
    images: [{ ...DEFAULT_SHARE_IMAGE }],
  },
  twitter: { card: "summary_large_image", images: [{ ...DEFAULT_SHARE_IMAGE }] },
  // Previews live on public workers.dev URLs: keep them out of search (spec 0008 AC-5).
  ...(isIndexable(getAppEnv()) ? {} : { robots: { index: false } }),
};

/** The site shell (spec 0004): skip link, header, main and footer around every page. */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-body text-text antialiased">
        <SkipLink />
        <Header name={SHELL_PROFILE.name} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer profile={SHELL_PROFILE} year={BUILD_YEAR} />
        <Analytics />
      </body>
    </html>
  );
}
