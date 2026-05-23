import { ApiProperty } from '@nestjs/swagger';
import type { TokensType } from '@ross2p/types';
import { RefreshTokenPayloadDto } from './refresh-token-payload.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class TokensDto implements TokensType {
  @ApiProperty({ type: TokenPayloadDto })
  accessToken!: TokenPayloadDto;

  @ApiProperty({ type: RefreshTokenPayloadDto })
  refreshToken!: RefreshTokenPayloadDto;
}
