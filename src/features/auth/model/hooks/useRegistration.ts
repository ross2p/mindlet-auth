import { useToast, setAccessToken } from "@ross2p/shared/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { register } from "../../api/auth";
import { type CreateUserDto } from "@ross2p/types";

export const useRegistration = () => {
    const { success, error } = useToast();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: CreateUserDto) => register(credentials),
        onSuccess: (data) => {
            if (data.data?.accessToken) {
                setAccessToken(data.data.accessToken);
            }
            void queryClient.invalidateQueries({ queryKey: ["me"] });
            success(data.message);
        },
        onError: (err: Error) => {
            error(err.message);
        },
    });
}