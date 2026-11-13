"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { twisterWordTypeLabels } from "@/data/twisterGlossary";
import type { TwisterGlossaryEntry } from "@/data/twisterGlossary";
import { wordGlossary } from "@/data/wordGlossary";
import { rememberWordOrigin, restoreWordOriginScroll } from "@/lib/wordReturn";
import { getWordHrefForForm } from "@/lib/words";

const TAP_POPOVER_MS = 4000;
const VIEWPORT_GUTTER_PX = 16;

const moreHint = {
  click: { en: "Click for more", ja: "クリックで詳しく見る" },
  tap: { en: "Tap again for more", ja: "もう一度タップで詳しく見る" },
};

// Only one popover is open at a time, across all sentences.
let closeOpenPopover: (() => void) | null = null;

// Defaults to the lesson sentence glossary. A tongue twister passes its own, where
// "word#2" is the entry for the second time that word appears.
export function GlossedSentence({
  sentence,
  glossary = wordGlossary,
}: {
  sentence: string;
  glossary?: Record<string, TwisterGlossaryEntry>;
}) {
  const seen = new Map<string, number>();

  // Coming back from a word page: return to where the learner clicked the word.
  useEffect(() => {
    restoreWordOriginScroll();
  }, []);

  return sentence.split(/([A-Za-z']+)/).map((part, index) => {
    const key = part.toLowerCase();
    const count = (seen.get(key) ?? 0) + 1;
    seen.set(key, count);
    const entry = (count > 1 ? glossary[`${key}#${count}`] : undefined) ?? glossary[key];

    return entry ? (
      <GlossedWord key={index} word={part} entry={entry} href={getWordHrefForForm(part)} />
    ) : (
      part
    );
  });
}

// With an href, a click (or Enter) opens the word page. On touch the first tap still
// shows the meaning and a second tap, while it is showing, opens the page.
function GlossedWord({
  word,
  entry,
  href,
}: {
  word: string;
  entry: TwisterGlossaryEntry;
  href: string | null;
}) {
  const { text } = useLanguage();
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const popoverRef = useRef<HTMLSpanElement>(null);
  const dismissTimer = useRef<number | null>(null);
  // How the current press started, since a click alone doesn't reliably say it was a touch.
  const pressPointerType = useRef<string | null>(null);
  // Whether the open popover came from a tap, so its hint says "tap" rather than "click".
  const [openedByTap, setOpenedByTap] = useState(false);

  function hide() {
    if (dismissTimer.current !== null) {
      window.clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
    setOpen(false);
  }

  function show() {
    closeOpenPopover?.();
    closeOpenPopover = hide;
    setOpen(true);
  }

  useEffect(
    () => () => {
      if (dismissTimer.current !== null) {
        window.clearTimeout(dismissTimer.current);
      }
    },
    [],
  );

  // Words near a screen edge would otherwise clip the popover. --shift moves the
  // box back on screen and moves the arrow the other way, so it stays on the word.
  useLayoutEffect(() => {
    const popover = popoverRef.current;

    if (!open || !popover) {
      return;
    }

    popover.style.removeProperty("--shift");
    const { left, right } = popover.getBoundingClientRect();
    const overflowLeft = VIEWPORT_GUTTER_PX - left;
    const overflowRight = right - (document.documentElement.clientWidth - VIEWPORT_GUTTER_PX);

    if (overflowLeft > 0) {
      popover.style.setProperty("--shift", `${overflowLeft}px`);
    } else if (overflowRight > 0) {
      popover.style.setProperty("--shift", `${-overflowRight}px`);
    }
  }, [open]);

  const triggerProps = {
    "aria-describedby": popoverId,
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== "touch") {
        setOpenedByTap(false);
        show();
      }
    },
    onPointerLeave: (event: PointerEvent) => {
      // A finger leaves as soon as it lifts, which must not close a tapped popover.
      if (event.pointerType !== "touch") {
        hide();
      }
    },
    onPointerDown: (event: PointerEvent) => {
      pressPointerType.current = event.pointerType;
    },
    onClick: (event: MouseEvent) => {
      const tapped = pressPointerType.current === "touch";
      pressPointerType.current = null;

      if (!tapped) {
        // Mouse or keyboard: a link just navigates, a plain word does nothing.
        if (href) {
          rememberWordOrigin();
        }
        return;
      }

      if (open) {
        // Second tap: a link goes through to its page, a plain word closes.
        if (href) {
          rememberWordOrigin();
        } else {
          hide();
        }
        return;
      }

      // First tap shows the meaning, even on a link.
      event.preventDefault();
      show();
      dismissTimer.current = window.setTimeout(hide, TAP_POPOVER_MS);
      setOpenedByTap(true);
    },
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (event.currentTarget.matches(":focus-visible")) {
        setOpenedByTap(false);
        show();
      }
    },
    onBlur: hide,
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hide();
      }
    },
    className: `${href ? "cursor-pointer" : "cursor-help"} select-none underline! decoration-dotted! underline-offset-4! transition [-webkit-touch-callout:none] focus:outline-none ${
      open ? "bg-white/10 decoration-white!" : "decoration-white/50!"
    }`,
  };

  return (
    <span className="relative inline-block">
      {href ? (
        <Link href={href} {...triggerProps}>
          {word}
        </Link>
      ) : (
        <button type="button" {...triggerProps}>
          {word}
        </button>
      )}
      <span
        ref={popoverRef}
        id={popoverId}
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-10 mb-2.5 w-max max-w-72 -translate-x-1/2 border border-white/20 bg-black px-4 py-2 [transform:translateX(var(--shift,0px))] ${
          open ? "block" : "hidden"
        }`}
      >
        <span className="flex items-center gap-3">
          {entry.image ? (
            <Image
              src={entry.image}
              alt=""
              width={56}
              height={56}
              loading="eager"
              className="h-14 w-14 shrink-0 border border-white/10 bg-white/[0.03] p-1.5"
            />
          ) : null}
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-white/50">
              {text(twisterWordTypeLabels[entry.type])}
            </span>
            <span className="mt-0.5 block text-[15px] leading-5 text-white">
              {text(entry.meaning)}
            </span>
            {href ? (
              <span className="mt-1 block text-xs text-white/40">
                {text(openedByTap ? moreHint.tap : moreHint.click)}
              </span>
            ) : null}
          </span>
        </span>
        <span
          aria-hidden
          className="absolute top-full left-[calc(50%-var(--shift,0px))] h-2 w-2 -translate-x-1/2 -translate-y-[calc(50%-0.5px)] rotate-45 border-r border-b border-white/20 bg-black"
        />
      </span>
    </span>
  );
}
