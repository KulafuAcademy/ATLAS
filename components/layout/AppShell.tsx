import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/layout/AppShellFrame";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AppShellFrame>{children}</AppShellFrame>
  );
}
