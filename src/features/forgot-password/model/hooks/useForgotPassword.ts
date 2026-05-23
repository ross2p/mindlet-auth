"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { forgotPassword } from "../../api/forgot-password";

export const useForgotPassword = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: (dto: { email: string }) => forgotPassword(dto),
    onSuccess: () => {
      toaster.success("If that email is registered, a reset link has been sent");
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
