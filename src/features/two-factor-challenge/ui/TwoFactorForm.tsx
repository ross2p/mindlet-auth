"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Radio, RadioGroup } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { OtpInput, ResendCountdownButton } from "@widgets/otp-input";
import { useVerifyTwoFactor } from "../model/hooks/useVerifyTwoFactor";
import { useResendTwoFactorCode } from "../model/hooks/useResendTwoFactorCode";
import { decodeAccessToken, getNextAuthStep } from "@entities/session";
import {
  defaultChallengeMethods,
  methodLabel,
  readTwoFactorChallenge,
  type TwoFactorMethodId,
  type TwoFactorMethodOption,
} from "../lib/challenge-methods";
import { listTwoFactorMethods } from "../api/two-factor";

function initialMethods(): TwoFactorMethodOption[] {
  return readTwoFactorChallenge()?.methods ?? defaultChallengeMethods();
}

function initialMethod(methods: TwoFactorMethodOption[]): TwoFactorMethodId {
  return methods.find((m) => m.available)?.id ?? "email";
}

export const TwoFactorForm = () => {
  const seedMethods = initialMethods();
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<TwoFactorMethodId>(() =>
    initialMethod(seedMethods),
  );
  const [methods, setMethods] = useState<TwoFactorMethodOption[]>(seedMethods);
  const { mutate: verify, isPending, error } = useVerifyTwoFactor();
  const { mutate: resend, isPending: isResending } = useResendTwoFactorCode();

  useEffect(() => {
    if (readTwoFactorChallenge()?.methods?.length) return;
    let cancelled = false;
    void listTwoFactorMethods()
      .then((res) => {
        if (cancelled || !res.methods?.length) return;
        setMethods(res.methods);
        const firstAvailable = res.methods.find((m) => m.available);
        if (firstAvailable) setMethod(firstAvailable.id);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const rateLimited = useMemo(() => {
    const message = error?.message ?? "";
    return /429|too many|rate/i.test(message);
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    verify(
      { method, code },
      {
        onSuccess: (response) => {
          const payload = decodeAccessToken(response.data.token);
          const step = payload ? getNextAuthStep(payload) : "dashboard";
          if (step === "verifyEmail") window.location.href = routes.verifyEmail;
          else window.location.href = routes.dashboard;
        },
      },
    );
  };

  return (
    <div>
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Two-factor auth
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          Choose an available method, then enter the code to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="animate-field animate-field-1">
          <RadioGroup
            name="two-factor-method"
            value={method}
            onChange={(value) => setMethod(value as TwoFactorMethodId)}
            className="gap-3"
          >
            {methods.map((option) => (
              <Radio
                key={option.id}
                value={option.id}
                label={
                  option.available
                    ? methodLabel(option.id)
                    : `${methodLabel(option.id)} (unavailable)`
                }
                disabled={!option.available}
              />
            ))}
          </RadioGroup>
        </div>

        <div className="animate-field animate-field-2">
          <OtpInput value={code} onChange={setCode} disabled={isPending} />
        </div>

        {rateLimited ? (
          <p className="text-center text-sm text-destructive" role="alert">
            Too many failed attempts — try again later.
          </p>
        ) : null}

        <div className="animate-field animate-field-3">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isPending}
            block
            disabled={code.length < 6 || !method}
            className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
          >
            {isPending ? "Verifying…" : "Confirm"}
          </Button>
        </div>

        {method === "email" ? (
          <div className="animate-field animate-field-3">
            <ResendCountdownButton
              onResend={() => resend()}
              isPending={isResending}
              startWithCooldown
            />
          </div>
        ) : null}
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
