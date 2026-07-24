"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import type { LoginType } from "@ross2p/types";
import { login } from "../../api/login";

export const useLogin = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginType) => login(dto),
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken.token);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(data.message);
    },
    onError: (err: Error & { status?: number }) => {
      const message = err.message ?? "Sign-in failed";
      if (err.status === 429 || /too many|rate/i.test(message)) {
        toaster.error("Too many sign-in attempts — try again later.");
        return;
      }
      toaster.error(message);
    },
  });
};
