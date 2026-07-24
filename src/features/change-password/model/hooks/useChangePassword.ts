"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { clearAccessToken } from "@ross2p/shared";
import { changePassword, requestChangePassword2fa } from "../../api/change-password";
import type { ChangePasswordDto } from "../../api/change-password";

export const useChangePassword = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: (dto: ChangePasswordDto) => changePassword(dto),
    onSuccess: () => {
      clearAccessToken();
      toaster.success("Password changed — please sign in again");
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};

export const useRequestChangePassword2fa = () => {
  const toaster = useToast();
  return useMutation({
    mutationFn: () => requestChangePassword2fa(),
    onSuccess: () => toaster.success("Verification code sent"),
    onError: (err: Error) => toaster.error(err.message),
  });
};
