export type ResetPasswordDto = {
  token: string;
  password?: string;
  newPassword?: string;
};
