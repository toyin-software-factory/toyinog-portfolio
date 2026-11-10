import { type JsonLdObject, serializeJsonLd } from "@/lib/seo/jsonLd";

/**
 * Structured data for search engines (spec 0008 AC-4). The script is data, not
 * code: browsers don't run `application/ld+json`, and `<` is escaped.
 */
export function JsonLd({ data }: { readonly data: JsonLdObject | readonly JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      // Built from our own content and escaped by serializeJsonLd.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
