import {
  AuthCredentialsProto,
  AuthCoreProto,
  AuthTwoFactorProto,
} from '@ross2p/common';
import { UserTokensDto } from './dto/user-tokens.dto';

/**
 * UserTokensDto already matches AuthCredentialsProto.UserTokens field-for-field
 * except each payload's `type` and the challenge methods' `id`: this app's
 * business-level unions ('access'|'refresh', 'email'|'totp'|'backup') aren't
 * structurally assignable to the proto's matching-value TS enums, so those
 * are the fields that need a cast.
 */
export function toUserTokens(
  dto: UserTokensDto,
): AuthCredentialsProto.UserTokens {
  return {
    ...dto,
    twoFactorChallenge: dto.twoFactorChallenge
      ? {
          ...dto.twoFactorChallenge,
          methods: dto.twoFactorChallenge.methods.map((method) => ({
            ...method,
            id: method.id as AuthTwoFactorProto.TwoFactorMethodId,
          })),
        }
      : null,
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
