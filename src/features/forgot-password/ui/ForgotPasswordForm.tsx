"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { useForgotPassword } from "../model/hooks/useForgotPassword";
import { forgotPasswordSchema } from "../model/schemas/forgot-password.schema";

type ForgotPasswordForm = { email: string };

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const ForgotPasswordForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const { handleSubmit, control, formState: { errors } } = useForm<ForgotPasswordForm>({
    resolver: joiResolver(forgotPasswordSchema),
  });

  const onSubmit = ({ email }: ForgotPasswordForm) => {
    forgotPassword(
      { email },
      {
        onSuccess: () => {
          setSentEmail(email);
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center animate-scale-in">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success ring-1 ring-success/25">
          <CheckCircleIcon />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Check your inbox
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          If <span className="font-medium text-foreground">{sentEmail}</span> is registered, we&apos;ve sent you a reset link. It expires in 15 minutes.
        </p>
        <a
          href={routes.login}
          className="mt-8 text-sm font-medium text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
        >
          ← Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 9.9-1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="animate-field animate-field-1">
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem
                label="Email"
                validateStatus={errors.email ? "error" : undefined}
                help={errors.email?.message}
              >
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  disabled={isPending}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-2 pt-1">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isPending}
            block
            className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? "Sending…" : "Send reset link"}
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
