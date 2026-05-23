"use client";

import { useState } from "react";
import { Button } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { OtpInput, ResendCountdownButton } from "@widgets/otp-input";
import { useVerifyEmail } from "../model/hooks/useVerifyEmail";
import { useResendEmailCode } from "../model/hooks/useResendEmailCode";
import { decodeAccessToken, getNextAuthStep } from "@entities/session";

export const VerifyEmailForm = () => {
  const [code, setCode] = useState("");
  const { mutate: verify, isPending } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendEmailCode();

  const hasError = false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    verify(
      { code },
      {
        onSuccess: (response) => {
          const payload = decodeAccessToken(response.data.token);
          const step = payload ? getNextAuthStep(payload) : "dashboard";
          if (step === "twoFactor") window.location.href = routes.twoFactor;
          else window.location.href = routes.dashboard;
        },
      }
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          We sent a 6-digit verification code to your email. Enter it below to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="animate-field animate-field-1">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={isPending}
            error={hasError}
          />
        </div>

        <div className="animate-field animate-field-2">
          <Button
            type="submit"
            size="lg"
            loading={isPending}
            loadingText="Verifying…"
            disabled={code.length !== 6}
            className="w-full transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
          >
            Verify email
          </Button>
        </div>

        <div className="animate-field animate-field-3">
          <ResendCountdownButton
            onResend={() => resend()}
            isPending={isResending}
            startWithCooldown
          />
        </div>
      </form>

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
};
