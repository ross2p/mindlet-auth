"use client";

import type { PropsWithChildren } from "react";

/** Brand logotype — displayed above the card. */
const Logo = () => (
  <div className="flex items-center gap-2 mb-8 select-none">
    <div className="relative h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-brand">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="h-5 w-5 text-white"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight text-foreground">
      Mindlet
    </span>
  </div>
);

/**
 * Full-screen shell for all auth pages.
 * Provides animated background orbs + centered glass card.
 */
export const AuthShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Gradient orb 1 — top-left */}
      <div
        aria-hidden
        className="animate-orb-1 pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-600/15"
      />
      {/* Gradient orb 2 — bottom-right */}
      <div
        aria-hidden
        className="animate-orb-2 pointer-events-none absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-brand-300/15 blur-3xl dark:bg-brand-700/10"
      />
      {/* Gradient orb 3 — center accent */}
      <div
        aria-hidden
        className="animate-orb-3 pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-violet-400/8 blur-3xl dark:bg-violet-600/6"
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-auth-card">
        <Logo />
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-xl px-8 py-10">
          {children}
        </div>
      </div>
    </div>
  );
};
