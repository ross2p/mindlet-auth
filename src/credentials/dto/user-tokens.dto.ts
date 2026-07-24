import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RefreshTokenPayloadDto } from '../../auth/dto/refresh-token-payload.dto';
import { TokenPayloadDto } from '../../auth/dto/token-payload.dto';
import { AuthUserDto } from './auth-user.dto';
import type { TwoFactorChallengeView } from '../../two-factor/two-factor-methods.util';

export class UserTokensDto {
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

  @ApiPropertyOptional({
    description:
      '2FA method picker when a challenge is required after password',
    nullable: true,
  })
  twoFactorChallenge!: TwoFactorChallengeView | null;

  @ApiProperty({ type: TokenPayloadDto })
  accessToken!: TokenPayloadDto;

  @ApiProperty({ type: RefreshTokenPayloadDto })
  refreshToken!: RefreshTokenPayloadDto;
}
