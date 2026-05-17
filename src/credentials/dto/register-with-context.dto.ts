import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from '@ross2p/types';

export class RegisterWithContext extends CreateUserDto {
  @ApiPropertyOptional({
    description: 'Client IP observed at registration',
    nullable: true,
    example: '203.0.113.10',
  })
  ipAddress: string | null;

  @ApiPropertyOptional({
    description: 'Raw User-Agent header from the client',
    nullable: true,
    example: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
  })
  userAgent: string | null;
}
