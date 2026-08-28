import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateUserType } from '@ross2p/types';

export class CreateUserDto implements CreateUserType {
  @ApiProperty({ format: 'email', example: 'user-a1b2@example.test' })
  email!: string;

  @ApiProperty({ example: 'Test' })
  firstName!: string;

  @ApiProperty({ example: 'User' })
  lastName!: string;

  @ApiProperty({ example: 'Passw0rd1' })
  password!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber?: string | null;
}
