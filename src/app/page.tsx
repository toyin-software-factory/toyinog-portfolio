import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl items-center px-6">
      <h1 className="text-4xl font-semibold tracking-tight">Toyin Ogunseinde</h1>
    </main>
  );
}
