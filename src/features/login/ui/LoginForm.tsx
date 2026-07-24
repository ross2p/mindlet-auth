"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { loginSchema } from "@ross2p/types/dist/schemas/auth/login.schema";
import type { LoginType } from "@ross2p/types";
import { useLogin } from "../model/hooks/useLogin";
import { decodeAccessToken, getNextAuthStep } from "@entities/session";
import { persistTwoFactorChallenge } from "@features/two-factor-challenge/lib/challenge-methods";

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

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const { handleSubmit, control, formState: { errors } } = useForm<LoginType>({
    resolver: joiResolver(loginSchema),
  });

  const onSubmit = (data: LoginType) => {
    login(data, {
      onSuccess: (response) => {
        persistTwoFactorChallenge(
          response.data.twoFactorChallenge as
            | import("@features/two-factor-challenge/lib/challenge-methods").TwoFactorChallengeSnapshot
            | null
            | undefined,
        );
        const payload = decodeAccessToken(response.data.accessToken.token);
        const step = payload
          ? getNextAuthStep(payload, {
              platformAccessOpen: response.data.platformAccessOpen,
            })
          : "dashboard";
        if (step === "twoFactor") window.location.href = routes.twoFactor;
        else if (step === "verifyEmail")
          window.location.href = routes.verifyEmail;
        else window.location.href = routes.dashboard;
      },
    });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to continue to Mindlet
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

        <div className="animate-field animate-field-2">
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <FormItem
                label="Password"
                validateStatus={errors.password ? "error" : undefined}
                help={errors.password?.message}
              >
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  disabled={isPending}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  }
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-3 flex justify-end -mt-1">
          <a
            href={routes.forgotPassword}
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <div className="animate-field animate-field-4 pt-1">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isPending}
            block
            className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? "Signing in…" : "Sign in"}
          </Button>
        </div>
      </form>

      <div className="animate-field animate-field-5 mt-6">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 border-t border-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 border-t border-border" />
        </div>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <a
            href={routes.registration}
            className="font-medium text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
          >
            Create one
          </a>
        </p>
      </div>
    </div>
  );
};
