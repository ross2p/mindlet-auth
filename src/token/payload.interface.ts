import type { TokenType } from './token-type.enum';

export interface Payload {
  type: TokenType;
  iat?: number;
  exp?: number;
}
