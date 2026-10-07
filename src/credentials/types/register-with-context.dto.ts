import type { CreateUserType } from '@ross2p/types';

export type RegisterWithContext = CreateUserType & {
  ipAddress: string | null;
  userAgent: string | null;
};
