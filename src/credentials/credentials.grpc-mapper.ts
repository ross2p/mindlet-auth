import { AuthCredentialsProto, AuthCoreProto } from '@ross2p/common';
import { UserTokensDto } from './dto/user-tokens.dto';

/**
 * UserTokensDto already matches AuthCredentialsProto.UserTokens field-for-field
 * except each payload's `type`: see auth.grpc-mapper.ts's toTokenPayload for why
 * that one needs a cast.
 */
export function toUserTokens(
  dto: UserTokensDto,
): AuthCredentialsProto.UserTokens {
  return {
    ...dto,
    twoFactorChallenge: dto.twoFactorChallenge ?? null,
    accessToken: {
      ...dto.accessToken,
      payload: {
        ...dto.accessToken.payload,
        type: dto.accessToken.payload.type as AuthCoreProto.TokenType,
      },
    },
    refreshToken: {
      ...dto.refreshToken,
      payload: {
        ...dto.refreshToken.payload,
        type: dto.refreshToken.payload.type as AuthCoreProto.TokenType,
      },
    },
  };
}
