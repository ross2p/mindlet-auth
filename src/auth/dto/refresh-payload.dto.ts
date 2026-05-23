import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { RefreshPayload } from '@ross2p/types';

export class RefreshPayloadDto implements RefreshPayload {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  sessionId!: string;

  @ApiProperty({ enum: ['refresh'] })
  type!: 'refresh';

  @ApiPropertyOptional()
  iat?: number;

  @ApiPropertyOptional()
  exp?: number;
}
