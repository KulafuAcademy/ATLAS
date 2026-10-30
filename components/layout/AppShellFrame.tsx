"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BackToTopButton } from "@/components/common/BackToTopButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { StaffSessionProvider } from "@/components/layout/StaffSessionProvider";
import { LanguageProvider } from "@/components/language/LanguageProvider";

export function AppShellFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/staff/")) return children;
  return <LanguageProvider><StaffSessionProvider><div className="min-h-screen bg-black text-white"><SiteHeader /><main id="top" className="mx-auto max-w-6xl scroll-mt-28 px-6 py-16 md:px-10 md:py-24">{children}</main><BackToTopButton /></div></StaffSessionProvider></LanguageProvider>;
}
