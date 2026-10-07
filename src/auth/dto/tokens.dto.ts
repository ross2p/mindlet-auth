import type { TokensType } from '@ross2p/types';
import { RefreshTokenPayloadDto } from './refresh-token-payload.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class TokensDto implements TokensType {
  accessToken!: TokenPayloadDto;

  refreshToken!: RefreshTokenPayloadDto;
}
