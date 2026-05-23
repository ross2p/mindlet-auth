import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AuthUserType } from '@ross2p/types';

export class AuthUserDto implements AuthUserType {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'email' })
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty()
  username!: string;

  @ApiPropertyOptional({ nullable: true })
  displayName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  bio!: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  bannerUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  phoneNumber!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  accountId!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: 'date-time' })
  emailVerifiedAt!: Date | null;

  @ApiProperty()
  twoFactorEnabled!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: Date;
}
