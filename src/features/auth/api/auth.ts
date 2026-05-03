import { apiV1Client } from "@ross2p/shared";
import {
  type CreateUserDto,
  type GlobalResponse,
  type LoginDto,
  type UserTokensDto,
} from "@ross2p/types";

export const login = async (login: LoginDto): Promise<GlobalResponse<UserTokensDto>> => {
  const response = await apiV1Client.post<GlobalResponse<UserTokensDto>>(
    "/auth/login",
    login,
  );
  return response.data;
};


export const register = async (register: CreateUserDto): Promise<GlobalResponse<UserTokensDto>> => {
  const response = await apiV1Client.post<GlobalResponse<UserTokensDto>>(
    "/auth/register",
    register,
  );
  return response.data;
};