"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import { redirectToNextAuthStep } from "@entities/session";
import { verifyTwoFactorCode } from "../../api/two-factor";
import type { TwoFactorMethodId } from "../../lib/challenge-methods";

export const useVerifyTwoFactor = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { method: TwoFactorMethodId; code: string }) =>
      verifyTwoFactorCode(dto),
    onSuccess: (data) => {
      const token = data.data.token;
      setAccessToken(token);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(data.message);
      redirectToNextAuthStep(token);
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
