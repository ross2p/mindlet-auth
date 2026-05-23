import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateUserType } from '@ross2p/types';

export class CreateUserDto implements CreateUserType {
  @ApiProperty({ format: 'email', example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'Jane' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  password!: string;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber?: string | null;
}
