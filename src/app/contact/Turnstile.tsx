"use client";

import Script from "next/script";
import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

type TurnstileApi = {
  render: (container: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export type TurnstileHandle = { readonly reset: () => void };

type TurnstileProps = {
  readonly siteKey: string;
  readonly ref?: Ref<TurnstileHandle>;
};

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Cloudflare Turnstile, rendered explicitly so it also works after client side
 * navigation. It adds the hidden `cf-turnstile-response` field to the form.
 */
export function Turnstile({ siteKey, ref }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const render = () => {
    const api = window.turnstile;
    if (!api || !container.current || widgetId.current) return;
    widgetId.current = api.render(container.current, { sitekey: siteKey, theme: "dark" });
  };

  useEffect(() => {
    render();
    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
    // The widget is rendered once per mount; the site key doesn't change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current) window.turnstile?.reset(widgetId.current);
    },
  }));

  return (
    <>
      <Script src={SCRIPT_URL} strategy="afterInteractive" onReady={render} />
      <div ref={container} className="min-h-[65px]" />
    </>
  );
}
