import { ApiPropertyOptional } from '@nestjs/swagger';
import type { LoginType } from '@ross2p/types';
import { LoginDto } from './login.dto';

export class LoginWithContext extends LoginDto implements LoginType {
  @ApiPropertyOptional({
    description: 'Client IP observed at sign-in',
    nullable: true,
    example: '203.0.113.10',
  })
  ipAddress: string | null = null;

  @ApiPropertyOptional({
    description: 'Raw User-Agent header from the client',
    nullable: true,
    example: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36',
  })
  userAgent: string | null = null;
}
