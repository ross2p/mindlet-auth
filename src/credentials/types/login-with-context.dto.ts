import type { LoginType } from '@ross2p/types';

export type LoginWithContext = LoginType & {
  ipAddress: string | null;
  userAgent: string | null;
};
