"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { useRegistration } from "../model/hooks/useRegistration";
import { createUserFormSchema } from "../model/schemas/create-user-form.schema";
import type { CreateUserFormDto } from "../model/types/create-user-form.type";
import { decodeAccessToken, getNextAuthStep } from "@entities/session";

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

export const RegistrationForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: register, isPending } = useRegistration();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormDto>({
    resolver: joiResolver(createUserFormSchema),
  });

  const onSubmit = ({ confirmPassword: _, ...dto }: CreateUserFormDto) => {
    register(dto, {
      onSuccess: (response) => {
        const payload = decodeAccessToken(response.data.accessToken.token);
        const step = payload
          ? getNextAuthStep(payload, {
              platformAccessOpen: response.data.platformAccessOpen,
            })
          : "verifyEmail";
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
          Create account
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Join Mindlet and start learning smarter
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3 animate-field animate-field-1">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormItem
                label="First name"
                validateStatus={errors.firstName ? "error" : undefined}
                help={errors.firstName?.message}
              >
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="given-name"
                  disabled={isPending}
                />
              </FormItem>
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <FormItem
                label="Last name"
                validateStatus={errors.lastName ? "error" : undefined}
                help={errors.lastName?.message}
              >
                <Input
                  {...field}
                  value={field.value ?? ""}
                  autoComplete="family-name"
                  disabled={isPending}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-2">
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
                  value={field.value ?? ""}
                  type="email"
                  autoComplete="email"
                  disabled={isPending}
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-3">
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
                  value={field.value ?? ""}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isPending}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((p) => !p)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  }
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-4">
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
                  value={field.value ?? ""}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  disabled={isPending}
                  suffix={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirm((p) => !p)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      <EyeIcon open={showConfirm} />
                    </button>
                  }
                />
              </FormItem>
            )}
          />
        </div>

        <div className="animate-field animate-field-5 pt-1">
          <Button
            htmlType="submit"
            type="primary"
            size="large"
            loading={isPending}
            block
            className="transition-all hover:shadow-brand hover:-translate-y-0.5 active:translate-y-0"
          >
            {isPending ? "Creating account…" : "Create account"}
          </Button>
        </div>
      </form>

      <p className="animate-field animate-field-5 mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <a
          href={routes.login}
          className="font-medium text-primary hover:text-primary-dark transition-colors underline-offset-4 hover:underline"
        >
          Sign in
        </a>
      </p>
    </div>
  );
};
