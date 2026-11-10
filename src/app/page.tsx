import type { Metadata } from "next";

import { getProfile } from "@/lib/content";

export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  // Proves the content wiring (spec 0002). The real Home page comes with scope feature 5.
  const profile = getProfile();

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl items-center px-6">
      <h1 className="text-4xl font-semibold tracking-tight">{profile.name}</h1>
    </main>
  );
}
