"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";

/**
 * useTranslations<T extends Record<string, string>>(defaults: T): T
 *
 * - Returns `defaults` immediately (English, zero latency).
 * - When the language context changes to a non-English language, calls
 *   POST /api/translate-ui to get Lingo.dev-localized strings.
 * - Falls back to `defaults` if the API call fails.
 *
 * Usage:
 *   const t = useTranslations({ title: "Travel Guide", search: "Search..." });
 *   // t.title, t.search are automatically translated when language switches
 */
export function useTranslations<T extends Record<string, string>>(defaults: T): T {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState<T>(defaults);
  // Track the defaults reference to detect if the caller changed them
  const defaultsRef = useRef(defaults);
  const abortRef = useRef<AbortController | null>(null);

  const translate = useCallback(
    async (lang: string, strings: T) => {
      if (lang === "en") {
        setTranslated(strings);
        return;
      }

      // Cancel any in-flight request
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/translate-ui", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strings, language: lang }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("translate-ui failed");
        const data = await res.json();
        setTranslated(data.strings as T);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        console.warn("useTranslations: falling back to English", err);
        setTranslated(strings);
      }
    },
    []
  );

  useEffect(() => {
    defaultsRef.current = defaults;
  });

  useEffect(() => {
    translate(language, defaultsRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return translated;
}
