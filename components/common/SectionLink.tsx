"use client";

import Link from "next/link";

import { useLanguage } from "@/components/language/LanguageProvider";
import type { LocalizedText } from "@/lib/i18n";

type SectionLinkProps = {
  title: LocalizedText;
  description: LocalizedText;
  href: string;
};

export function SectionLink({ title, description, href }: SectionLinkProps) {
  const { text } = useLanguage();

  return (
    <Link
      href={href}
      className="group border border-white/10 p-6 transition hover:border-white/35"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-3">
          <h2 className="text-2xl font-medium text-white">{text(title)}</h2>
          <p className="leading-7 text-white/55">{text(description)}</p>
        </div>
        <span className="text-2xl text-white/35 transition group-hover:text-white">
          /
        </span>
      </div>
    </Link>
  );
}
