import type { TwoFactorChallengeType, UserTokensType } from '@ross2p/types';
import { RefreshTokenPayloadDto } from '../../auth/dto/refresh-token-payload.dto';
import { TokenPayloadDto } from '../../auth/dto/token-payload.dto';
import { AuthUserDto } from './auth-user.dto';

export class UserTokensDto implements UserTokensType {
  user!: AuthUserDto;

  is2faEnabled!: boolean;

  platformAccessOpen!: boolean;

  sessionId!: string;

  twoFactorChallenge!: TwoFactorChallengeType | null;

  accessToken!: TokenPayloadDto;

  refreshToken!: RefreshTokenPayloadDto;
}
