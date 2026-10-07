import type { AuthUserType } from '@ross2p/types';

export class AuthUserDto implements AuthUserType {
  id!: string;

  email!: string;

  firstName!: string;

  lastName!: string;

  username!: string;

  displayName!: string | null;

  bio!: string | null;

  avatarUrl!: string | null;

  bannerUrl!: string | null;

  phoneNumber!: string | null;

  accountId!: string | null;

  emailVerifiedAt!: Date | null;

  twoFactorEnabled!: boolean;

  createdAt!: Date;

  updatedAt!: Date;
}
