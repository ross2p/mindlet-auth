import type { ResetPasswordDto } from "../../api/reset-password";

/** Extends ResetPasswordDto with a UI-only confirmPassword field (not sent to the API). */
export type ResetPasswordFormDto = ResetPasswordDto & {
  confirmPassword: string;
};
