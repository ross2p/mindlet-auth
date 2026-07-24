import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangePasswordDto {
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
    enum: ['email', 'totp', 'backup'],
  })
  twoFactorMethod?: 'email' | 'totp' | 'backup' | null;

  @ApiPropertyOptional({
    description: '2FA challenge code when 2FA is enabled',
    nullable: true,
  })
  twoFactorCode?: string | null;
}
