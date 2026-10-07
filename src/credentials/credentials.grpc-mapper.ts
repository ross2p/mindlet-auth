import { AuthCredentialsProto, AuthCoreProto } from '@ross2p/common';
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
      displayName: dto.user.displayName,
      bio: dto.user.bio,
      avatarUrl: dto.user.avatarUrl,
      bannerUrl: dto.user.bannerUrl,
      phoneNumber: dto.user.phoneNumber,
      accountId: dto.user.accountId,
      emailVerifiedAt: dto.user.emailVerifiedAt,
      twoFactorEnabled: dto.user.twoFactorEnabled,
      createdAt: dto.user.createdAt,
      updatedAt: dto.user.updatedAt,
    },
    is2faEnabled: dto.is2faEnabled,
    platformAccessOpen: dto.platformAccessOpen,
    sessionId: dto.sessionId,
    twoFactorChallenge: dto.twoFactorChallenge ?? null,
    accessToken: {
      token: dto.accessToken.token,
      payload: {
        id: dto.accessToken.payload.id,
        email: dto.accessToken.payload.email,
        sessionId: dto.accessToken.payload.sessionId,
        twoFactorVerifiedAt: dto.accessToken.payload.twoFactorVerifiedAt,
        emailVerifiedAt: dto.accessToken.payload.emailVerifiedAt,
        type: dto.accessToken.payload.type as AuthCoreProto.TokenType,
        iat: dto.accessToken.payload.iat,
        exp: dto.accessToken.payload.exp,
      },
      expiresAt: dto.accessToken.expiresAt,
    },
    refreshToken: {
      token: dto.refreshToken.token,
      payload: {
        id: dto.refreshToken.payload.id,
        sessionId: dto.refreshToken.payload.sessionId,
        type: dto.refreshToken.payload.type as AuthCoreProto.TokenType,
        iat: dto.refreshToken.payload.iat,
        exp: dto.refreshToken.payload.exp,
      },
      expiresAt: dto.refreshToken.expiresAt,
    },
  };
}
