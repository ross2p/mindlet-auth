import { apiV1Client } from "@ross2p/shared";
import type { GlobalResponse } from "@ross2p/types";
import type { TokenDto } from "@entities/session";

export type VerifyEmailResponse = GlobalResponse<TokenDto>;

/** Submits the 6-digit code from the verification email. Returns a new access token. */
export async function verifyEmailCode(dto: {
  id: string;
  code: string;
}): Promise<VerifyEmailResponse> {
  const response = await apiV1Client.post<VerifyEmailResponse>(
    "/auth/verify-email/verify",
    dto
  );
  return response.data;
}

export type ResendEmailCodeResponse = GlobalResponse<{
  id: string;
  userId: string;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}>;

/** Triggers a re-send of the verification email to the currently signed-in user. */
export async function resendEmailVerificationCode(): Promise<ResendEmailCodeResponse> {
  const response = await apiV1Client.post<ResendEmailCodeResponse>(
    "/auth/verify-email/resend-code"
  );
  return response.data;
}
