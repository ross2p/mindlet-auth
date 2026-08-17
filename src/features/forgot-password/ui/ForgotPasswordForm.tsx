"use client";

import { useForm, Controller } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Input, Button, FormItem, EnvelopeIcon } from "@ross2p/shared";
import {
  forgotPasswordSchema,
  type ForgotPasswordType,
} from "@ross2p/types";
import { useForgotPassword } from "../model/hooks/useForgotPassword";

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
}

export const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ForgotPasswordType>({
    resolver: joiResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = ({ email }: ForgotPasswordType) => {
    forgotPassword(
      { email },
      {
        onSuccess: () => onSuccess(email),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="animate-field animate-field-1">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormItem
              label="Email"
              required
              validateStatus={errors.email ? "error" : undefined}
              help={errors.email?.message}
            >
              <Input
                {...field}
                value={field.value ?? ""}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                allowClear
                size="large"
                disabled={isPending}
                prefix={<EnvelopeIcon size={18} />}
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
  );
};
