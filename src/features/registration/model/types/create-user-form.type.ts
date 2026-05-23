import type { CreateUserDto } from "@ross2p/types";

/** Extends CreateUserDto with a UI-only confirmPassword field (not sent to the API). */
export type CreateUserFormDto = CreateUserDto & {
  confirmPassword: string;
};
