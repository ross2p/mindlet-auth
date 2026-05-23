"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import { verifyEmailCode } from "../../api/email-verification";

export const useVerifyEmail = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { code: string }) => verifyEmailCode(dto),
    onSuccess: (data) => {
      setAccessToken(data.data.token);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(data.message);
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
