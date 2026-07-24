import { apiV1Client } from "@ross2p/shared";
import {
  type CreateUserType,
  type GlobalResponse,
  type LoginType,
  type UserTokensType,
} from "@ross2p/types";

export const login = async (login: LoginType): Promise<GlobalResponse<UserTokensType>> => {
  const response = await apiV1Client.post<GlobalResponse<UserTokensType>>(
    "/auth/login",
    login,
  );
  return response.data;
};


export const register = async (register: CreateUserType): Promise<GlobalResponse<UserTokensType>> => {
  const response = await apiV1Client.post<GlobalResponse<UserTokensType>>(
    "/auth/register",
    register,
  );
  return response.data;
};