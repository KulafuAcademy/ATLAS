// Remembers where a word page was opened from, so its back button can return
// to that page at the same scroll position.

const KEY = "atlas:word-return";

type WordReturn = { path: string; scrollY: number; returning: boolean };

function read(): WordReturn | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WordReturn) : null;
  } catch {
    return null;
  }
}

function write(value: WordReturn | null) {
  try {
    if (value) {
      window.sessionStorage.setItem(KEY, JSON.stringify(value));
    } else {
      window.sessionStorage.removeItem(KEY);
    }
  } catch {
    // Storage blocked: the back button falls back to the lesson link.
  }
}

/** Call when a word link is followed. */
export function rememberWordOrigin() {
  write({
    path: window.location.pathname + window.location.search,
    scrollY: window.scrollY,
    returning: false,
  });
}

/** The page the word was opened from, or null when it was opened directly. */
export function getWordOrigin() {
  return read()?.path ?? null;
}

/** Call from the word page's back button, just before navigating back. */
export function markReturningToOrigin() {
  const origin = read();
  if (origin) {
    write({ ...origin, returning: true });
  }
}

/** On the origin page: scroll back to where the learner was, once. */
export function restoreWordOriginScroll() {
  const origin = read();
  const here = window.location.pathname + window.location.search;

  if (!origin?.returning || origin.path !== here) {
    return;
  }

  write(null);
  // Wait a frame so the page has its full height before scrolling.
  window.requestAnimationFrame(() => window.scrollTo({ top: origin.scrollY, behavior: "instant" }));
}
