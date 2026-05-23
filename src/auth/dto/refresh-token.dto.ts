import { ApiProperty } from '@nestjs/swagger';
import type { RefreshTokenType } from '@ross2p/types';

export class RefreshTokenDto implements RefreshTokenType {
  @ApiProperty({
    description: 'Refresh JWT used to obtain a new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;
}
