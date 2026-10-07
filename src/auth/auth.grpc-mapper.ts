import { AuthCoreProto, AuthenticatedUser } from '@ross2p/common';
import { TokenPayloadDto } from './dto/token-payload.dto';

export function toAuthenticatedUserMessage(
  user: AuthenticatedUser,
): AuthCoreProto.AuthenticatedUserMessage {
  return {
    id: user.id,
    email: user.email,
    sessionId: user.sessionId,
    twoFactorVerifiedAt: user.twoFactorVerifiedAt,
    emailVerifiedAt: user.emailVerifiedAt,
  };
}

export function toTokenPayload(
  dto: TokenPayloadDto,
): AuthCoreProto.TokenPayload {
  return {
    token: dto.token,
    payload: {
      id: dto.payload.id,
      email: dto.payload.email,
      sessionId: dto.payload.sessionId,
      twoFactorVerifiedAt: dto.payload.twoFactorVerifiedAt,
      emailVerifiedAt: dto.payload.emailVerifiedAt,
      type: dto.payload.type as AuthCoreProto.TokenType,
      iat: dto.payload.iat,
      exp: dto.payload.exp,
    },
    expiresAt: dto.expiresAt,
  };
}
