import { ApiProperty } from '@nestjs/swagger';
import type { LoginType } from '@ross2p/types';

export class LoginDto implements LoginType {
  @ApiProperty({
    description: 'Account email address',
    format: 'email',
    example: 'user-a1b2@example.test',
  })
  email!: string;

  @ApiProperty({
    description: 'Account password',
    example: 'Passw0rd1',
  })
  password!: string;
}
