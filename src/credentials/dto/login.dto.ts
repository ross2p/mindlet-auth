import { ApiProperty } from '@nestjs/swagger';
import type { LoginType } from '@ross2p/types';

export class LoginDto implements LoginType {
  @ApiProperty({
    description: 'Account email address',
    format: 'email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Account password',
    example: 'P@ssw0rd!',
  })
  password!: string;
}
