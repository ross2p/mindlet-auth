import { apiV1Client } from "@ross2p/shared";
import type { GlobalResponse } from "@ross2p/types";
import type { AuthTokensData } from "@entities/session";
import type { CreateUserDto } from "@ross2p/types";

export type RegisterResponse = GlobalResponse<AuthTokensData>;

export async function register(dto: CreateUserDto): Promise<RegisterResponse> {
  const response = await apiV1Client.post<RegisterResponse>(
    "/auth/credentials/register",
    dto
  );
  return response.data;
}
