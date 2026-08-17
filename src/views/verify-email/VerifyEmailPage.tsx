"use client";

import { VerifyEmailForm } from "@features/email-verification";
import { EnvelopeIcon, routes } from "@ross2p/shared";

export const VerifyEmailPage = () => (
  <div>
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
        <EnvelopeIcon size={28} />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Check your email
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        We sent a 6-digit verification code to your email. Enter it below to
        continue.
      </p>
    </div>

    <VerifyEmailForm />

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
