"use client";

import { useLanguage } from "@/components/language/LanguageProvider";

const languageButtonClassName =
  "h-9 border border-white bg-white px-3 text-xs font-semibold text-black transition hover:bg-black hover:text-white focus:outline-none";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-2 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`${languageButtonClassName} ${
          language === "en" ? "" : "opacity-80 hover:opacity-100"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ja")}
        className={`${languageButtonClassName} ${
          language === "ja" ? "" : "opacity-80 hover:opacity-100"
        }`}
      >
        日本語
      </button>
    </div>
  );
}
