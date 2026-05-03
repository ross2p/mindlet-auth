"use client";

import { joiResolver } from "@hookform/resolvers/joi";
import { Controller, useForm } from "react-hook-form";
import { useRegistration } from "../model/hooks/useRegistration";
import { Button, Input } from "@ross2p/shared";
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
          <Input
            {...field}
            value={field.value ?? ""}
            label="First Name"
            type="text"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="lastName"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label="Last Name"
            type="text"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label="Email"
            type="email"
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label="Password"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label="Confirm Password"
            type="password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={isPending}
          />
        )}
      />
      <Controller
        name="phoneNumber"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            value={field.value ?? ""}
            label="Phone"
            type="tel"
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber?.message}
            disabled={isPending}
          />
        )}
      />
      <Button type="submit" size="lg" disabled={isPending}>
        {isPending ? "Loading... " : "Login"}
      </Button>
    </form>
  );
};
