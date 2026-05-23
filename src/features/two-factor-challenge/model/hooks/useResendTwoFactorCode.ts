"use client";

import { useMutation } from "@tanstack/react-query";
import { useToast } from "@ross2p/shared/hooks";
import { resendTwoFactorCode } from "../../api/two-factor";

export const useResendTwoFactorCode = () => {
  const toaster = useToast();

  return useMutation({
    mutationFn: resendTwoFactorCode,
    onSuccess: () => {
      toaster.success("Two-factor code sent");
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
