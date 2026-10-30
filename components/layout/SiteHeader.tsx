"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { LanguageToggle } from "@/components/language/LanguageToggle";
import { navItems } from "@/lib/navigation";

export function SiteHeader() {
  const { text } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu with Escape.
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-5 min-[500px]:gap-6 md:px-10">
        <Link
          href="/#top"
          onClick={closeMenu}
          className="text-lg font-semibold tracking-[0.32em]"
        >
          ATLAS
        </Link>

        <div className="flex items-center gap-3 min-[500px]:gap-5">
          {/* 500px and up: links sit inline. */}
          <nav aria-label="Primary navigation" className="hidden gap-5 text-sm min-[500px]:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/60 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageToggle />
          <a href="/staff/logout" className="hidden text-xs text-white/55 transition hover:text-white min-[500px]:inline">Sign out</a>
          {/* Phones: links move into a menu. */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={
              menuOpen
                ? text({ en: "Close menu", ja: "メニューを閉じる" })
                : text({ en: "Open menu", ja: "メニューを開く" })
            }
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/20 text-white transition hover:border-white focus:outline-none focus-visible:border-white min-[500px]:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-navigation"
          aria-label="Primary navigation"
          className="border-t border-white/10 px-6 pb-2 min-[500px]:hidden"
        >
          <a href="/staff/logout" onClick={closeMenu} className="block border-b border-white/10 py-4 text-base text-white/70">Sign out</a>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className="block border-b border-white/10 py-4 text-base text-white/70 transition last:border-b-0 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
