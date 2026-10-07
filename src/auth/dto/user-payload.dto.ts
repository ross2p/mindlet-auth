import type { UserPayload } from '@ross2p/types';

export class UserPayloadDto implements UserPayload {
  id!: string;

  email!: string;

  sessionId!: string;

  twoFactorVerifiedAt!: Date | null;

  emailVerifiedAt!: Date | null;

  type!: 'access' | 'refresh';

  iat?: number;

  exp?: number;
}
