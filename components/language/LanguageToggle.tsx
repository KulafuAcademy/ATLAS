"use client";

import { useLanguage } from "@/components/language/LanguageProvider";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex border border-white/10 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`h-9 px-3 transition ${
          language === "en"
            ? "bg-white text-black"
            : "text-white/55 hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ja")}
        className={`h-9 px-3 transition ${
          language === "ja"
            ? "bg-white text-black"
            : "text-white/55 hover:text-white"
        }`}
      >
        日本語
      </button>
    </div>
  );
}
