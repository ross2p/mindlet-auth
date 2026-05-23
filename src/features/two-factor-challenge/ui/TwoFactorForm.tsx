"use client";

import { useState } from "react";
import { Button } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { OtpInput, ResendCountdownButton } from "@widgets/otp-input";
import { useVerifyTwoFactor } from "../model/hooks/useVerifyTwoFactor";
import { useResendTwoFactorCode } from "../model/hooks/useResendTwoFactorCode";
import { decodeAccessToken, getNextAuthStep } from "@entities/session";

export const TwoFactorForm = () => {
  const [code, setCode] = useState("");
  const { mutate: verify, isPending } = useVerifyTwoFactor();
  const { mutate: resend, isPending: isResending } = useResendTwoFactorCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    verify(
      { code },
      {
        onSuccess: (response) => {
          const payload = decodeAccessToken(response.data.token);
          const step = payload ? getNextAuthStep(payload) : "dashboard";
          if (step === "verifyEmail") window.location.href = routes.verifyEmail;
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Two-factor auth
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          A 6-digit code was sent to your registered email. Enter it to confirm your identity.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="animate-field animate-field-1">
          <OtpInput
            value={code}
            onChange={setCode}
            disabled={isPending}
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
            Confirm
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
