"use client";

import { useEffect } from "react";

import { clearSentCookie } from "../actions";

/** Clears the one time cookie after the thank you page renders (spec 0007, AC-10). */
export function ClearSentCookie() {
  useEffect(() => {
    void clearSentCookie();
  }, []);
  return null;
}
