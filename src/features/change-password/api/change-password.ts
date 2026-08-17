import { apiV1Client } from "@ross2p/shared";

export type ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
  twoFactorCode?: string | null;
};

export async function requestChangePassword2fa(): Promise<void> {
  await apiV1Client.post("/auth/change-password/request-2fa");
}

export async function changePassword(dto: ChangePasswordDto): Promise<void> {
  await apiV1Client.post("/auth/change-password", dto);
}
