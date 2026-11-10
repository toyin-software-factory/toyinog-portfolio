import Image from "next/image";
import type { ReactNode } from "react";

import { Prose } from "@/components/ui";
import type { ImageRef } from "@/lib/content";

type IntroProps = {
  readonly photo: ImageRef;
  /** Build time HTML of the bio (spec 0002). */
  readonly bioHtml: string;
  /** Shown under the bio, for example the CV download. */
  readonly children?: ReactNode;
};

/** Photo beside the bio from `md` up, stacked on phones (spec 0006, AC-1 and AC-2). */
export function Intro({ photo, bioHtml, children }: IntroProps) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-5">
        <Image
          src={photo.src}
          alt={photo.alt}
          width={800}
          height={1000}
          sizes="(min-width: 768px) 40vw, 100vw"
          preload
          fetchPriority="high"
          className="aspect-[4/5] h-auto w-full bg-surface object-cover"
        />
      </div>
      <div className="flex flex-col gap-8 md:col-span-7">
        <Prose html={bioHtml} />
        {children}
      </div>
    </div>
  );
}
