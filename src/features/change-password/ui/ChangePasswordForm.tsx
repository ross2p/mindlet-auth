"use client";

import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem } from "@ross2p/shared";
import Joi from "joi";
import {
  useChangePassword,
  useRequestChangePassword2fa,
} from "../model/hooks/useChangePassword";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorCode?: string;
};

const schema = Joi.object<FormValues>({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)/)
    .required()
    .messages({
      "string.pattern.base": "Password needs a letter and a digit",
      "string.min": "Password must be at least 8 characters",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({ "any.only": "Passwords do not match" }),
  twoFactorCode: Joi.string().allow("").optional(),
});

export const ChangePasswordForm = () => {
  const { mutate: changePassword, isPending, isSuccess } = useChangePassword();
  const { mutate: request2fa, isPending: isSending2fa } =
    useRequestChangePassword2fa();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: joiResolver(schema),
  });

  const onSubmit = ({ confirmPassword: _, ...dto }: FormValues) => {
    changePassword(dto);
  };

  if (isSuccess) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Current password"
            validateStatus={errors.currentPassword ? "error" : undefined}
            help={errors.currentPassword?.message}
          >
            <Input {...field} type="password" autoComplete="current-password" />
          </FormItem>
        )}
      />
      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <FormItem
            label="New password"
            validateStatus={errors.newPassword ? "error" : undefined}
            help={errors.newPassword?.message}
          >
            <Input {...field} type="password" autoComplete="new-password" />
          </FormItem>
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Confirm new password"
            validateStatus={errors.confirmPassword ? "error" : undefined}
            help={errors.confirmPassword?.message}
          >
            <Input {...field} type="password" autoComplete="new-password" />
          </FormItem>
        )}
      />
      <Controller
        name="twoFactorCode"
        control={control}
        render={({ field }) => (
          <FormItem
            label="2FA code (if enabled)"
            help="Request a code first if your account has 2FA on"
          >
            <Input {...field} inputMode="numeric" autoComplete="one-time-code" />
          </FormItem>
        )}
      />

      <Button
        htmlType="button"
        type="default"
        size="large"
        loading={isSending2fa}
        block
        onClick={() => request2fa()}
      >
        Send 2FA code
      </Button>

      <Button
        htmlType="submit"
        type="primary"
        size="large"
        loading={isPending}
        block
      >
        Update password
      </Button>
    </form>
  );
};
