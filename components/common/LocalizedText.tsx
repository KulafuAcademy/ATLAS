"use client";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText as LocalizedTextValue } from "@/lib/i18n";

type LocalizedTextProps = {
  value: LocalizedTextValue;
};

export function LocalizedText({ value }: LocalizedTextProps) {
  const { text } = useLanguage();

  return text(value);
}
