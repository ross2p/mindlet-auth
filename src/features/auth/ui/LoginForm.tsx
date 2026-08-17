"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { type LoginType } from "@ross2p/types";
import { useForm, Controller } from "react-hook-form";
import { useLogin } from "../model/hooks/useLogin";
import { Input, Button, FormItem } from "@ross2p/shared";
import { loginSchema } from "@ross2p/types/dist/schemas/auth/login.schema";

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: joiResolver(loginSchema),
  });

  const onSubmit = (data: LoginType) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Email"
            validateStatus={errors.email ? "error" : undefined}
            help={errors.email?.message}
          >
            <Input {...field} type="email" disabled={isPending} />
          </FormItem>
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Password"
            validateStatus={errors.password ? "error" : undefined}
            help={errors.password?.message}
          >
            <Input {...field} type="password" disabled={isPending} />
          </FormItem>
        )}
      />
      <Button
        htmlType="submit"
        type="primary"
        size="large"
        disabled={isPending}
      >
        {isPending ? "Loading... " : "Login"}
      </Button>
    </form>
  );
};
