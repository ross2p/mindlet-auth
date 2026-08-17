import type { CreateUserType } from "@ross2p/types";

/** Extends CreateUserType with a UI-only confirmPassword field (not sent to the API). */
export type CreateUserFormDto = CreateUserType & {
  confirmPassword: string;
};
