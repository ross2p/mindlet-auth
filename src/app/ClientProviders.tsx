"use client";

import {
  AppShell,
  QueryProvider,
  ThemeProvider,
  ToasterProvider,
} from "@ross2p/shared";
import type { PropsWithChildren } from "react";

export function ClientProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AppShell>{children}</AppShell>
        <ToasterProvider />
      </QueryProvider>
    </ThemeProvider>
  );
}
