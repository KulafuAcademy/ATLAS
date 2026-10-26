"use client";

import { useEffect, useRef, useState } from "react";

import { checkHealth } from "@/lib/pronunciationApi";

export type ServerStatus = "checking" | "online" | "offline";

const pollIntervalMs = 30_000;

/**
 * Polls GET /health so the page can show whether the checker is reachable.
 * Does nothing while `enabled` is false.
 */
export function useServerStatus(enabled = true) {
  const [status, setStatus] = useState<ServerStatus>("checking");
  const recheckRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let timeoutId = 0;

    async function poll() {
      window.clearTimeout(timeoutId);
      const ok = await checkHealth(controller.signal);

      if (controller.signal.aborted) return;

      setStatus(ok ? "online" : "offline");
      timeoutId = window.setTimeout(poll, pollIntervalMs);
    }

    recheckRef.current = () => void poll();
    void poll();

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
      recheckRef.current = () => {};
    };
  }, [enabled]);

  return {
    status,
    /** Checks again right away, e.g. after a request failed to connect. */
    recheck: () => recheckRef.current(),
  };
}
