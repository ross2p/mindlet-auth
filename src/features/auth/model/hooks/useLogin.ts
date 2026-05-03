import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../api/auth";
import { type LoginDto } from "@ross2p/types";
import { setAccessToken, useToast } from "@ross2p/shared/hooks";

export const useLogin = () => {
    const toaster = useToast();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (credentials: LoginDto) => login(credentials),
        onSuccess: (data) => {
            if (data.data?.accessToken) {
                setAccessToken(data.data.accessToken);
            }
            void queryClient.invalidateQueries({ queryKey: ["me"] });
            toaster.success(data.message);
        },
        onError: (err: Error) => {
            toaster.error(err.message);
        },
    });
};
