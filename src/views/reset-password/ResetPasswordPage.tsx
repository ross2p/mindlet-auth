"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@features/reset-password";
import { Button, LockIcon, Result, routes } from "@ross2p/shared";

export const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  if (!token) {
    return (
      <Result
        status="error"
        title="Invalid link"
        subTitle="This reset link is missing or has expired."
        extra={
          <Button type="link" href={routes.forgotPassword}>
            Request a new link
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <LockIcon size={28} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong new password for your account
        </p>
      </div>

      <ResetPasswordForm token={token} />

      <div className="animate-field animate-field-3 mt-6 text-center">
        <a
          href={routes.login}
          className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  );
};
