import { type CreateUserDto } from "@ross2p/types";

export type CreateUserFormDto = CreateUserDto & {
    confirmPassword: string;
}