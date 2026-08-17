import { type CreateUserType } from "@ross2p/types";

export type CreateUserFormDto = CreateUserType & {
    confirmPassword: string;
}