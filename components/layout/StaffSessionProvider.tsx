"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { setStaffStorageIdentity } from "@/lib/trainingProgress";

export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (pathname.startsWith("/staff/")) return;
    let cancelled = false;
    void fetch("/api/staff/me", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("Staff session expired");
      return response.json() as Promise<{ id: string }>;
    }).then(({ id }) => {
      if (cancelled) return;
      setStaffStorageIdentity(id);
      setReady(true);
    }).catch(() => { if (!cancelled) window.location.assign("/staff/login"); });
    return () => { cancelled = true; };
  }, [pathname]);
  return ready || pathname.startsWith("/staff/") ? children : <div className="min-h-screen bg-black" aria-label="Loading staff workspace" />;
}
