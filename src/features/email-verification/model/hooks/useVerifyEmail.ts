"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import { redirectToNextAuthStep } from "@entities/session";
import { verifyEmailCode } from "../../api/email-verification";

export const useVerifyEmail = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { id: string; code: string }) => verifyEmailCode(dto),
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
