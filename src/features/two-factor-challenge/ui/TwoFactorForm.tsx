"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Tab, Tabs, TabsList, TabPanel } from "@ross2p/shared";
import { OtpInput, ResendCountdownButton } from "@widgets/otp-input";
import { useVerifyTwoFactor } from "../model/hooks/useVerifyTwoFactor";
import { useResendTwoFactorCode } from "../model/hooks/useResendTwoFactorCode";
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

  const handleMethodChange = (value: TwoFactorMethodId | null) => {
    setMethod(value ?? method);
    setCode("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    verify({ method, code });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Tabs value={method} onValueChange={handleMethodChange}>
        <div className="animate-field animate-field-1">
          <TabsList variant="segmented" className="w-full">
            {methods.map((option) => (
              <Tab
                key={option.id}
                value={option.id}
                variant="segmented"
                disabled={!option.available}
              >
                {methodLabel(option.id)}
              </Tab>
            ))}
          </TabsList>
        </div>

        {methods.map((option) => (
          <TabPanel key={option.id} value={option.id} className="space-y-6">
            <div className="animate-field animate-field-2">
              <OtpInput value={code} onChange={setCode} disabled={isPending} />
            </div>

            {rateLimited && (
              <p className="text-center text-sm text-destructive" role="alert">
                Too many failed attempts — try again later.
              </p>
            )}

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

            {option.id === "email" && (
              <div className="animate-field animate-field-3">
                <ResendCountdownButton
                  onResend={() => resend()}
                  isPending={isResending}
                  startWithCooldown
                />
              </div>
            )}
          </TabPanel>
        ))}
      </Tabs>
    </form>
  );
};
