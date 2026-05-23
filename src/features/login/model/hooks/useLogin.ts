"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import type { LoginDto } from "@ross2p/types";
import { login } from "../../api/login";

export const useLogin = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: LoginDto) => login(dto),
    onSuccess: (data) => {
      setAccessToken(data.data.accessToken.token);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toaster.success(data.message);
    },
    onError: (err: Error) => {
      toaster.error(err.message);
    },
  });
};
