"use client";

import { TwoFactorForm } from "@features/two-factor-challenge";
import { LockIcon, routes } from "@ross2p/shared";

export const TwoFactorPage = () => (
  <div>
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <LockIcon size={28} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Two-factor auth
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        Choose an available method, then enter the code to continue.
      </p>
    </div>

    <TwoFactorForm />

    <div className="animate-field animate-field-3 mt-4 text-center">
      <a
        href={routes.login}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
      >
        ← Back to sign in
      </a>
    </div>
  </div>
);
