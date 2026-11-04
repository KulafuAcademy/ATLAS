"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { useLanguage } from "@/components/language/LanguageProvider";
import { wordGlossary, wordTypeLabels } from "@/data/wordGlossary";
import type { GlossaryEntry } from "@/data/wordGlossary";
import { splitSentence } from "@/lib/sentenceTimings";

const HOLD_DELAY_MS = 300;
const VIEWPORT_GUTTER_PX = 16;
// The shadow pads the highlight without moving the words around it.
const SPOKEN_WORD_CLASS = "bg-white text-black shadow-[0_0_0_2px_#fff]";

export function GlossedSentence({
  sentence,
  activeWord = -1,
}: {
  sentence: string;
  // Index of the word being spoken, or -1 when none is.
  activeWord?: number;
}) {
  return splitSentence(sentence).map((part, index) => {
    if (index % 2 === 0) return part;

    const entry = wordGlossary[part.toLowerCase()];
    const spoken = (index - 1) / 2 === activeWord;

    return entry ? (
      <GlossedWord key={index} word={part} entry={entry} spoken={spoken} />
    ) : (
      <span key={index} className={spoken ? SPOKEN_WORD_CLASS : undefined}>
        {part}
      </span>
    );
  });
}

function GlossedWord({
  word,
  entry,
  spoken,
}: {
  word: string;
  entry: GlossaryEntry;
  spoken: boolean;
}) {
  const { text } = useLanguage();
  const [open, setOpen] = useState(false);
  const popoverId = useId();
  const popoverRef = useRef<HTMLSpanElement>(null);
  // Set from the moment a touch lands until it lifts, including after the popover opens.
  const holdTimer = useRef<number | null>(null);

  function hide() {
    if (holdTimer.current !== null) {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setOpen(false);
  }

  useEffect(
    () => () => {
      if (holdTimer.current !== null) {
        window.clearTimeout(holdTimer.current);
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

  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-describedby={popoverId}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") {
            setOpen(true);
          }
        }}
        onPointerLeave={hide}
        onPointerDown={(event) => {
          if (event.pointerType === "touch") {
            holdTimer.current = window.setTimeout(() => setOpen(true), HOLD_DELAY_MS);
          }
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "touch") {
            hide();
          }
        }}
        onPointerCancel={hide}
        onContextMenu={(event) => {
          // A long press would open the browser menu on top of the popover.
          if (holdTimer.current !== null) {
            event.preventDefault();
          }
        }}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible")) {
            setOpen(true);
          }
        }}
        onBlur={hide}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            hide();
          }
        }}
        className={`cursor-help select-none underline decoration-dotted underline-offset-4 [-webkit-touch-callout:none] focus:outline-none ${
          spoken
            ? `${SPOKEN_WORD_CLASS} decoration-black`
            : open
              ? "bg-white/10 decoration-white"
              : "decoration-white/50"
        }`}
      >
        {word}
      </button>
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
              {text(wordTypeLabels[entry.type])}
            </span>
            <span className="mt-0.5 block text-[15px] leading-5 text-white">
              {text(entry.meaning)}
            </span>
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
