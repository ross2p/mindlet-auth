"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { forgotPassword } from "../../api/forgot-password";

export const useForgotPassword = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: (dto: { email: string }) => forgotPassword(dto),
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
