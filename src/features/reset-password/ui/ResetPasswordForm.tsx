"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { useResetPassword } from "../model/hooks/useResetPassword";
import { resetPasswordFormSchema } from "../model/schemas/reset-password-form.schema";
import type { ResetPasswordFormDto } from "../model/types/reset-password-form.type";

interface ResetPasswordFormProps {
  /** Token read from the URL query param `?token=...` */
  token: string;
}

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const { handleSubmit, control, formState: { errors } } = useForm<ResetPasswordFormDto>({
    resolver: joiResolver(resetPasswordFormSchema),
    defaultValues: { token },
  });

  const onSubmit = ({ confirmPassword: _, ...dto }: ResetPasswordFormDto) => {
    resetPassword(dto, {
      onSuccess: () => {
        window.location.href = routes.login;
      },
    });
  };

  if (!token) {
    return (
      <div className="text-center animate-scale-in">
        <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-foreground">Invalid link</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This reset link is missing or has expired.
        </p>
        <a
          href={routes.forgotPassword}
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Request a new link
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Reset password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose a strong new password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="animate-field animate-field-1">
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <FormItem
                label="New password"
                validateStatus={errors.newPassword ? "error" : undefined}
                help={errors.newPassword?.message}
              >
                <Input
                  {...field}
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isPending}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNew((p) => !p)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <EyeIcon open={showNew} />
                    </button>
                  }
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-2">
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <FormItem
                label="Confirm password"
                validateStatus={errors.confirmPassword ? "error" : undefined}
                help={errors.confirmPassword?.message}
              >
                <Input
                  {...field}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isPending}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((p) => !p)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  }
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-3 pt-1">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isPending}
            block
            className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? "Resetting…" : "Set new password"}
          </Button>
        </div>
      </form>

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
