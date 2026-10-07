import type { RefreshTokenType } from '@ross2p/types';

export class RefreshTokenDto implements RefreshTokenType {
  refreshToken!: string;
}
