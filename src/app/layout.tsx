import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import type { ReactNode } from "react";

import { SkipLink } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: "Portfolio of Toyin Ogunseinde.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${inter.variable}`}>
      <body className="min-h-dvh bg-bg font-sans text-body text-text antialiased">
        <SkipLink />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
