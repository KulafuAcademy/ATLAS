import type { ReactNode } from "react";

import { BackToTopButton } from "@/components/common/BackToTopButton";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { LanguageProvider } from "@/components/language/LanguageProvider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <main
          id="top"
          className="mx-auto max-w-6xl scroll-mt-28 px-6 py-16 md:px-10 md:py-24"
        >
          {children}
        </main>
        <BackToTopButton />
      </div>
    </LanguageProvider>
  );
}
