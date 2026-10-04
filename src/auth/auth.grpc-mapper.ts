import { AuthCoreProto, AuthenticatedUser } from '@ross2p/common';
import { TokenPayloadDto } from './dto/token-payload.dto';

export function toAuthenticatedUserMessage(
  user: AuthenticatedUser,
): AuthCoreProto.AuthenticatedUserMessage {
  return {
    id: user.id,
    email: user.email,
    sessionId: user.sessionId,
    twoFactorVerifiedAt: user.twoFactorVerifiedAt?.toISOString() ?? undefined,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? undefined,
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
      twoFactorVerifiedAt:
        dto.payload.twoFactorVerifiedAt?.toISOString() ?? undefined,
      emailVerifiedAt: dto.payload.emailVerifiedAt?.toISOString() ?? undefined,
      type: dto.payload.type,
      iat: dto.payload.iat,
      exp: dto.payload.exp,
    },
    expiresAt: dto.expiresAt.toISOString(),
  };
}
