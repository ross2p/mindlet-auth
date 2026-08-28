"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { persistSessionTokens, useToast } from "@ross2p/shared/hooks";
import type { CreateUserType } from "@ross2p/types";
import { redirectToNextAuthStep } from "@entities/session";
import { register } from "../../api/register";

export const useRegistration = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserType) => register(dto),
    onSuccess: (response) => {
      const token = response.data.accessToken.token;
      persistSessionTokens({
        accessToken: token,
        refreshToken: response.data.refreshToken.token,
      });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(response.message);
      redirectToNextAuthStep(
        token,
        { platformAccessOpen: response.data.platformAccessOpen },
        "verifyEmail",
      );
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
