import { ApiProperty } from '@nestjs/swagger';
import type { DisableTwoFactorEnrollmentType } from '@ross2p/types';

export class DisableTwoFactorEnrollmentDto implements DisableTwoFactorEnrollmentType {
  @ApiProperty({
    description: 'Current account password',
    example: 'CurrentSecret1',
  })
  password!: string;
}
