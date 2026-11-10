/** First focusable element on every page. Hidden until focused, then jumps to `#main`. */
export function SkipLink({ targetId = "main" }: { readonly targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only bg-accent text-small text-on-accent focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:inline-flex focus:min-h-11 focus:items-center focus:px-4 focus:font-medium"
    >
      Skip to content
    </a>
  );
}
