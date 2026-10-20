import type { AuthCoreProto } from '../../generated/protos';

export interface Payload {
  type: AuthCoreProto.TokenType;
  iat?: number;
  exp?: number;
}
