import { apiV1Client } from "@ross2p/shared";
import type { GlobalResponse } from "@ross2p/types";
import type { TokenDto } from "@entities/session";
import type {
  TwoFactorMethodId,
  TwoFactorMethodOption,
} from "../lib/challenge-methods";

export type VerifyTwoFactorResponse = GlobalResponse<TokenDto>;

export async function listTwoFactorMethods(): Promise<{
  methods: TwoFactorMethodOption[];
}> {
  const response = await apiV1Client.get<
    GlobalResponse<{ methods: TwoFactorMethodOption[] }>
  >("/auth/2fa/methods");
  return response.data.data;
}

/** Submits the selected method + code. Returns a new access token. */
export async function verifyTwoFactorCode(dto: {
  method: TwoFactorMethodId;
  code: string;
}): Promise<VerifyTwoFactorResponse> {
  const response = await apiV1Client.post<VerifyTwoFactorResponse>(
    "/auth/2fa/verify",
    dto,
  );
  return response.data;
}

/** Triggers a re-send of the 2FA login code to the currently signed-in user. */
export async function resendTwoFactorCode(): Promise<void> {
  await apiV1Client.post("/auth/2fa/resend-code");
}
