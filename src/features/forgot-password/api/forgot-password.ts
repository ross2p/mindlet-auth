import { apiV1Client } from "@ross2p/shared";

/** Sends a password-reset link to the given email address. Returns no data. */
export async function forgotPassword(dto: { email: string }): Promise<void> {
  await apiV1Client.post("/auth/forgot-password", dto);
}
