"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { resendEmailVerificationCode } from "../../api/email-verification";

export const useResendEmailCode = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: resendEmailVerificationCode,
    onSuccess: () => {
      toaster.success("Verification code sent");
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
