import { ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateUserType } from '@ross2p/types';
import { CreateUserDto } from './create-user.dto';

export class RegisterWithContext
  extends CreateUserDto
  implements CreateUserType
{
  @ApiPropertyOptional({
    description: 'Client IP observed at registration',
    nullable: true,
    example: '203.0.113.10',
  })
  ipAddress: string | null = null;

  @ApiPropertyOptional({
    description: 'Raw User-Agent header from the client',
    nullable: true,
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  })
  userAgent: string | null = null;
}
