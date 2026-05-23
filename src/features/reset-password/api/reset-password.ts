import { apiV1Client } from "@ross2p/shared";

export type ResetPasswordDto = {
  /** Single-use reset token extracted from the email link query param. */
  token: string;
  newPassword: string;
};

/** Completes the password-reset flow. Returns no data. */
export async function resetPassword(dto: ResetPasswordDto): Promise<void> {
  await apiV1Client.post("/auth/password-reset/reset-password", dto);
}
