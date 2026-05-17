import { ApiProperty } from '@nestjs/swagger';

export class DisableTwoFactorEnrollmentDto {
  @ApiProperty({
    description: 'Current account password',
    example: 'CurrentSecret1',
  })
  password!: string;
}
