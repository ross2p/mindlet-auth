import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TWO_FACTOR_METHOD_IDS, type ChangePasswordType } from '@ross2p/types';

export class ChangePasswordDto implements ChangePasswordType {
  @ApiProperty({
    description: 'Current account password',
    example: 'Passw0rd1',
  })
  currentPassword!: string;

  @ApiProperty({
    description: 'New account password',
    example: 'Passw0rd2',
  })
  newPassword!: string;

  @ApiPropertyOptional({
    description: '2FA method when enabled (email | totp | backup)',
    nullable: true,
    enum: TWO_FACTOR_METHOD_IDS,
  })
  twoFactorMethod?: ChangePasswordType['twoFactorMethod'];

  @ApiPropertyOptional({
    description: '2FA challenge code when 2FA is enabled',
    nullable: true,
  })
  twoFactorCode?: string | null;
}
