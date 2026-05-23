import { apiV1Client } from "@ross2p/shared";
import type { GlobalResponse } from "@ross2p/types";
import type { TokenDto } from "@entities/session";

export type VerifyTwoFactorResponse = GlobalResponse<TokenDto>;

/** Submits the 6-digit 2FA code from the login email. Returns a new access token. */
export async function verifyTwoFactorCode(dto: {
  code: string;
}): Promise<VerifyTwoFactorResponse> {
  const response = await apiV1Client.post<VerifyTwoFactorResponse>(
    "/auth/2fa/verify",
    dto
  );
  return response.data;
}

/** Triggers a re-send of the 2FA login code to the currently signed-in user. */
export async function resendTwoFactorCode(): Promise<void> {
  await apiV1Client.post("/auth/2fa/resend-code");
}
