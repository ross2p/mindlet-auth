"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { resetPassword, type ResetPasswordDto } from "../../api/reset-password";

export const useResetPassword = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: (dto: ResetPasswordDto) => resetPassword(dto),
    onSuccess: () => {
      toaster.success("Password reset successful");
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
