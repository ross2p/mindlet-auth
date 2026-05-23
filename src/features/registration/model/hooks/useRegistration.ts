"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";
import type { CreateUserDto } from "@ross2p/types";
import { register } from "../../api/register";

export const useRegistration = () => {
  const toaster = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUserDto) => register(dto),
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
