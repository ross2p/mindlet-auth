import { ApiProperty } from '@nestjs/swagger';
import type { ConfirmTwoFactorEnrollmentType } from '@ross2p/types';

export class ConfirmTwoFactorEnrollmentDto implements ConfirmTwoFactorEnrollmentType {
  @ApiProperty({
    description: 'Six-digit code sent to the account email',
    example: '123456',
  })
  code!: string;
}
