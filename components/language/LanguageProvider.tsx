"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import type { Language, LocalizedText } from "@/lib/i18n";
import { resolveText } from "@/lib/i18n";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  text: (value: LocalizedText) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLanguage = window.localStorage.getItem("atlas-language");

  if (storedLanguage === "en" || storedLanguage === "ja") {
    return storedLanguage;
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        setLanguageState(nextLanguage);
        window.localStorage.setItem("atlas-language", nextLanguage);
        document.documentElement.lang = nextLanguage === "ja" ? "ja" : "en";
      },
      text(valueToResolve) {
        return resolveText(valueToResolve, language);
      },
    }),
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language === "ja" ? "ja" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
