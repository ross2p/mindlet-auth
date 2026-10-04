import { AuthCredentialsProto } from '@ross2p/common';
import { UserTokensDto } from './dto/user-tokens.dto';

export function toUserTokens(
  dto: UserTokensDto,
): AuthCredentialsProto.UserTokens {
  return {
    user: {
      id: dto.user.id,
      email: dto.user.email,
      firstName: dto.user.firstName,
      lastName: dto.user.lastName,
      username: dto.user.username,
      displayName: dto.user.displayName ?? undefined,
      bio: dto.user.bio ?? undefined,
      avatarUrl: dto.user.avatarUrl ?? undefined,
      bannerUrl: dto.user.bannerUrl ?? undefined,
      phoneNumber: dto.user.phoneNumber ?? undefined,
      accountId: dto.user.accountId ?? undefined,
      emailVerifiedAt: dto.user.emailVerifiedAt?.toISOString() ?? undefined,
      twoFactorEnabled: dto.user.twoFactorEnabled,
      createdAt: dto.user.createdAt.toISOString(),
      updatedAt: dto.user.updatedAt.toISOString(),
    },
    is2faEnabled: dto.is2faEnabled,
    platformAccessOpen: dto.platformAccessOpen,
    sessionId: dto.sessionId,
    twoFactorChallenge: dto.twoFactorChallenge ?? undefined,
    accessToken: {
      token: dto.accessToken.token,
      payload: {
        id: dto.accessToken.payload.id,
        email: dto.accessToken.payload.email,
        sessionId: dto.accessToken.payload.sessionId,
        twoFactorVerifiedAt:
          dto.accessToken.payload.twoFactorVerifiedAt?.toISOString() ??
          undefined,
        emailVerifiedAt:
          dto.accessToken.payload.emailVerifiedAt?.toISOString() ?? undefined,
        type: dto.accessToken.payload.type,
        iat: dto.accessToken.payload.iat,
        exp: dto.accessToken.payload.exp,
      },
      expiresAt: dto.accessToken.expiresAt.toISOString(),
    },
    refreshToken: {
      token: dto.refreshToken.token,
      payload: {
        id: dto.refreshToken.payload.id,
        sessionId: dto.refreshToken.payload.sessionId,
        type: dto.refreshToken.payload.type,
        iat: dto.refreshToken.payload.iat,
        exp: dto.refreshToken.payload.exp,
      },
      expiresAt: dto.refreshToken.expiresAt.toISOString(),
    },
  };
}
