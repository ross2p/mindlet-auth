"use client";

import { useState } from "react";
import { Button } from "@ross2p/shared";
import { OtpInput, ResendCountdownButton } from "@widgets/otp-input";
import { useVerifyEmail } from "../model/hooks/useVerifyEmail";
import { useResendEmailCode } from "../model/hooks/useResendEmailCode";

export const VerifyEmailForm = () => {
  const [code, setCode] = useState("");
  const { mutate: verify, isPending } = useVerifyEmail();
  const { mutate: resend, isPending: isResending } = useResendEmailCode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    verify({ code });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="animate-field animate-field-1">
        <OtpInput value={code} onChange={setCode} disabled={isPending} />
      </div>

      <div className="animate-field animate-field-2">
        <Button
          htmlType="submit"
          type="primary"
          size="large"
          loading={isPending}
          block
          disabled={code.length !== 6}
          className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0 disabled:translate-y-0"
        >
          {isPending ? "Verifying…" : "Verify email"}
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
  );
};
