import type { AuthCoreProto } from '@ross2p/common';

export interface Payload {
  type: AuthCoreProto.TokenType;
  iat?: number;
  exp?: number;
}
