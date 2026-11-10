import { buttonClass } from "@/components/ui/buttonStyles";
import { formatMonth } from "@/lib/format/date";

import { CV_DOWNLOAD_NAME } from "../copy";

type CvDownloadProps = {
  /** Site path of the PDF, checked to exist at build time (spec 0002). */
  readonly file: string;
  /** When the CV was last updated, as "YYYY-MM". */
  readonly updated: string;
};

/**
 * The "Download CV" button and its "Last updated" date (spec 0006, AC-5). A plain
 * `<a download>` styled as the primary button: `ButtonLink` wraps `next/link`,
 * which is for pages, not files.
 */
export function CvDownload({ file, updated }: CvDownloadProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <a href={file} download={CV_DOWNLOAD_NAME} className={buttonClass("primary")}>
        Download CV (PDF)
      </a>
      <p className="text-small text-text-muted">
        Last updated <time dateTime={updated}>{formatMonth(updated, "long")}</time>
      </p>
    </div>
  );
}
