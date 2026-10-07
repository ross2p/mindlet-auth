import type { AuthCoreProto, AuthTwoFactorProto } from '@ross2p/common';
import type {
  RefreshPayload,
  RefreshTokenPayloadType,
  TokenPayloadType,
  TokensType,
  TwoFactorChallengeType,
  UserPayload,
  UserTokensType,
} from '@ross2p/types';

/**
 * The shared `@ross2p/types` shapes use string-literal unions for `type` and the
 * 2FA method `id`; the gRPC layer uses real enums. These variants carry the
 * enums so service results can be returned from gRPC handlers without casts.
 */
export type UserPayloadDto = Omit<UserPayload, 'type'> & {
  type: AuthCoreProto.TokenType;
};

export type RefreshPayloadDto = Omit<RefreshPayload, 'type'> & {
  type: AuthCoreProto.TokenType.refresh;
};

export type TokenPayloadDto = Omit<TokenPayloadType, 'payload'> & {
  payload: UserPayloadDto;
};

export type RefreshTokenPayloadDto = Omit<
  RefreshTokenPayloadType,
  'payload'
> & {
  payload: RefreshPayloadDto;
};

export type TokensDto = Omit<TokensType, 'accessToken' | 'refreshToken'> & {
  accessToken: TokenPayloadDto;
  refreshToken: RefreshTokenPayloadDto;
};

type TwoFactorMethodDto = {
  id: AuthTwoFactorProto.TwoFactorMethodId;
  available: boolean;
};

export type TwoFactorChallengeDto = Omit<TwoFactorChallengeType, 'methods'> & {
  methods: TwoFactorMethodDto[];
};

export type UserTokensDto = Omit<
  UserTokensType,
  'accessToken' | 'refreshToken' | 'twoFactorChallenge'
> &
  Required<Pick<UserTokensType, 'sessionId' | 'platformAccessOpen'>> & {
    accessToken: TokenPayloadDto;
    refreshToken: RefreshTokenPayloadDto;
    twoFactorChallenge: TwoFactorChallengeDto | null;
  };
