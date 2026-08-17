"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem, PasswordVisibilityIcon } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { loginSchema } from "@ross2p/types/dist/schemas/auth/login.schema";
import type { LoginType } from "@ross2p/types";
import { useLogin } from "../model/hooks/useLogin";

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: joiResolver(loginSchema),
  });

  return (
    <form
      onSubmit={handleSubmit((data) => login(data))}
      noValidate
      className="space-y-4"
    >
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
                    <PasswordVisibilityIcon visible={showPassword} />
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
  );
};
