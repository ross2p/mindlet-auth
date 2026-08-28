"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { persistSessionTokens, useToast } from "@ross2p/shared/hooks";
import type { LoginType } from "@ross2p/types";
import { redirectToNextAuthStep } from "@entities/session";
import { persistTwoFactorChallenge } from "@features/two-factor-challenge/lib/challenge-methods";
import { login } from "../../api/login";

export const useLogin = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginType) => login(dto),
    onSuccess: (response) => {
      const token = response.data.accessToken.token;
      persistSessionTokens({
        accessToken: token,
        refreshToken: response.data.refreshToken.token,
      });
      persistTwoFactorChallenge(response.data.twoFactorChallenge);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(response.message);
      redirectToNextAuthStep(token, {
        platformAccessOpen: response.data.platformAccessOpen,
      });
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
