import { apiV1Client } from "@ross2p/shared";
import type { GlobalResponse } from "@ross2p/types";
import type { AuthTokensData } from "@entities/session";
import type { LoginType } from "@ross2p/types";

export type LoginResponse = GlobalResponse<AuthTokensData>;

export async function login(dto: LoginType): Promise<LoginResponse> {
  const response = await apiV1Client.post<LoginResponse>(
    "/auth/credentials/login",
    dto
  );
  return response.data;
}
