'use client';

import { joiResolver } from "@hookform/resolvers/joi";
import { type LoginDto } from "@ross2p/types";
import { useForm, Controller } from "react-hook-form";
import { useLogin } from "../model/hooks/useLogin";
import { Input, Button } from "@ross2p/shared";
import { loginSchema } from "@ross2p/types/dist/schemas/auth/login.schema";

export const LoginForm = () => {
    const {mutate: login, isPending} = useLogin()

    const {handleSubmit, control, formState: {errors}} = useForm<LoginDto>({
        resolver: joiResolver(loginSchema),
    })

    const onSubmit = (data: LoginDto) => {
        login(data);
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
            name="email"
            control={control}
            render={({ field }) => (
            <Input
                {...field}
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isPending}
            />
            )}
        />
        <Controller
            name="password"
            control={control}
            render={({ field }) => (
            <Input
                {...field}
                label="Password"
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isPending}
            />
            )}
        />
        <Button 
            type="submit" 
            size="lg"
            disabled={isPending}
        >
            {isPending ? 'Loading... ' : 'Login'}
        </Button>
    </form>
    );
};

