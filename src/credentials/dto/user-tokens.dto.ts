import { ApiProperty } from '@nestjs/swagger';
import type { UserTokensType } from '@ross2p/types';
import { RefreshTokenPayloadDto } from '../../auth/dto/refresh-token-payload.dto';
import { TokenPayloadDto } from '../../auth/dto/token-payload.dto';
import { AuthUserDto } from './auth-user.dto';

export class UserTokensDto implements UserTokensType {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({
    description: 'Whether two-factor authentication is enabled for the user',
  })
  is2faEnabled!: boolean;

  @ApiProperty({
    description:
      'Whether Platform access is open (email verified and 2FA challenge complete if required)',
  })
  platformAccessOpen!: boolean;

  @ApiProperty({
    description: 'Current session id',
    format: 'uuid',
  })
  sessionId!: string;

  @ApiProperty({ type: TokenPayloadDto })
  accessToken!: TokenPayloadDto;

  @ApiProperty({ type: RefreshTokenPayloadDto })
  refreshToken!: RefreshTokenPayloadDto;
}
