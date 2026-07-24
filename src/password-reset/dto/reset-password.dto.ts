import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token from the email link',
    example: '<opaque-reset-token>',
  })
  token!: string;

  @ApiPropertyOptional({
    description: 'New account password (OpenAPI field name)',
    example: 'Passw0rd2',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'New account password (as-built alias)',
    example: 'Passw0rd2',
  })
  newPassword?: string;
}
