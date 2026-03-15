"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  languageName: string;
  autoDetected: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  languageName: "English",
  autoDetected: false,
});

// Supported language codes in priority order
const SUPPORTED_CODES = ["en", "ja", "zh", "es", "fr", "de", "it", "pt", "ar", "hi", "ko", "ru", "tr", "th", "vi"];

/** Detect the best matching supported language from browser navigator.languages */
function detectBrowserLanguage(): string {
  if (typeof window === "undefined") return "en";
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    // Try exact match first (e.g. "fr-FR" → "fr"), then base code
    const base = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_CODES.includes(base)) return base;
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect browser language on first mount; respect user override stored in sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("atlasia_lang");
    if (stored && SUPPORTED_CODES.includes(stored)) {
      setLanguageState(stored);
    } else {
      const detected = detectBrowserLanguage();
      if (detected !== "en") {
        setLanguageState(detected);
        setAutoDetected(true);
      }
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setAutoDetected(false);
    // Persist manual choice for the session so auto-detect doesn't override
    sessionStorage.setItem("atlasia_lang", lang);
  };

  const languageNames: Record<string, string> = {
    en: "English",
    ja: "Japanese",
    zh: "Chinese",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ar: "Arabic",
    hi: "Hindi",
    ko: "Korean",
    ru: "Russian",
    tr: "Turkish",
    th: "Thai",
    vi: "Vietnamese",
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        languageName: languageNames[language] || "English",
        autoDetected,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
