"use client";

import { useState } from "react";
import { ForgotPasswordForm } from "@features/forgot-password";
import {
  ArrowLeftIcon,
  Button,
  Chip,
  ClockIcon,
  LockIcon,
  Result,
  routes,
} from "@ross2p/shared";

export const ForgotPasswordPage = () => {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  if (sentEmail) {
    return (
      <Result
        status="success"
        title="Check your inbox"
        subTitle={
          <>
            If{" "}
            <span className="font-medium text-foreground">{sentEmail}</span> is
            registered, we&apos;ve sent you a reset link.
          </>
        }
        extra={
          <div className="flex flex-col items-center gap-3">
            <Button
              type="link"
              href={routes.login}
              icon={<ArrowLeftIcon size={16} />}
            >
              Back to sign in
            </Button>
            <Button type="text" onClick={() => setSentEmail(null)}>
              Use a different email
            </Button>
          </div>
        }
      >
        <Chip
          size="sm"
          variant="outlined"
          icon={<ClockIcon size={14} />}
          label="Expires in 15 minutes"
        />
      </Result>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <LockIcon size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <ForgotPasswordForm onSuccess={setSentEmail} />

      <div className="animate-field animate-field-3 mt-6 text-center">
        <Button
          type="link"
          href={routes.login}
          icon={<ArrowLeftIcon size={16} />}
          className="text-muted-foreground hover:text-primary"
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
};
