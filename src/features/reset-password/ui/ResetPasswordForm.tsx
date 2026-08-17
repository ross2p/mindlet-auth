"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem, PasswordVisibilityIcon } from "@ross2p/shared";
import { routes } from "@ross2p/shared";
import { useResetPassword } from "../model/hooks/useResetPassword";
import { resetPasswordFormSchema } from "../model/schemas/reset-password-form.schema";
import type { ResetPasswordFormDto } from "../model/types/reset-password-form.type";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetPasswordFormDto>({
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

  return (
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
                    <PasswordVisibilityIcon visible={showNew} />
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
                    <PasswordVisibilityIcon visible={showConfirm} />
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
  );
};
