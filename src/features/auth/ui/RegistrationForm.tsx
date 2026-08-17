"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { Controller, useForm } from "react-hook-form";
import { useRegistration } from "../model/hooks/useRegistration";
import { Button, FormItem, Input } from "@ross2p/shared";
import { CreateUserFormDto } from "../model/types/create-user-form.type";
import { createUserFormSchema } from "../model/schemas/create-user-form.schema";

export const RegistrationForm = () => {
  const { mutate: register, isPending } = useRegistration();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserFormDto>({
    resolver: joiResolver(createUserFormSchema),
  });

  const onSubmit = (data: CreateUserFormDto) => {
    register(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="firstName"
        control={control}
        render={({ field }) => (
          <FormItem
            label="First Name"
            validateStatus={errors.firstName ? "error" : undefined}
            help={errors.firstName?.message}
          >
            <Input
              {...field}
              value={field.value ?? ""}
              type="text"
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
            label="Last Name"
            validateStatus={errors.lastName ? "error" : undefined}
            help={errors.lastName?.message}
          >
            <Input
              {...field}
              value={field.value ?? ""}
              type="text"
              disabled={isPending}
            />
          </FormItem>
        )}
      />
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
              disabled={isPending}
            />
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
            <Input
              {...field}
              value={field.value ?? ""}
              type="password"
              disabled={isPending}
            />
          </FormItem>
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Confirm Password"
            validateStatus={errors.confirmPassword ? "error" : undefined}
            help={errors.confirmPassword?.message}
          >
            <Input
              {...field}
              value={field.value ?? ""}
              type="password"
              disabled={isPending}
            />
          </FormItem>
        )}
      />
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <FormItem
            label="Phone"
            validateStatus={errors.phoneNumber ? "error" : undefined}
            help={errors.phoneNumber?.message}
          >
            <Input
              {...field}
              value={field.value ?? ""}
              type="tel"
              disabled={isPending}
            />
          </FormItem>
        )}
      />
      <Button htmlType="submit" type="primary" size="large" disabled={isPending}>
        {isPending ? "Loading... " : "Login"}
      </Button>
    </form>
  );
};
