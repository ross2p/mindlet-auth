"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem, PasswordVisibilityIcon } from "@ross2p/shared";
import { useRegistration } from "../model/hooks/useRegistration";
import { createUserFormSchema } from "../model/schemas/create-user-form.schema";
import type { CreateUserFormDto } from "../model/types/create-user-form.type";

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
    register(dto);
  };

  return (
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
                    <PasswordVisibilityIcon visible={showPassword} />
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
                    <PasswordVisibilityIcon visible={showConfirm} />
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
  );
};
