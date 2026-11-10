import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { SkipLink } from "@/components/ui";
import { getProfile } from "@/lib/content";
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

/** Root metadata from the profile (spec 0004, AC-10). Pages set only their own part of the title. */
export function generateMetadata(): Metadata {
  const { name, headline, intro } = getProfile();
  return {
    metadataBase: new URL(SITE_URL),
    title: { template: `%s · ${name}`, default: `${name} · ${headline}` },
    description: intro,
  };
}

/** The site shell (spec 0004): skip link, header, main and footer around every page. */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const profile = getProfile();
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-body text-text antialiased">
        <SkipLink />
        <Header name={profile.name} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer profile={profile} year={new Date().getFullYear()} />
      </body>
    </html>
  );
}
