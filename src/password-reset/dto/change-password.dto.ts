import type { ChangePasswordType } from '@ross2p/types';

export class ChangePasswordDto implements ChangePasswordType {
  currentPassword!: string;

  newPassword!: string;

  twoFactorMethod?: ChangePasswordType['twoFactorMethod'];

  twoFactorCode?: string | null;
}
