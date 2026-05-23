import { ApiProperty } from '@nestjs/swagger';
import type { RefreshTokenPayloadType } from '@ross2p/types';
import { RefreshPayloadDto } from './refresh-payload.dto';

export class RefreshTokenPayloadDto implements RefreshTokenPayloadType {
  @ApiProperty({
    description: 'Encoded refresh JWT string',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'Decoded refresh JWT payload',
    type: RefreshPayloadDto,
  })
  payload!: RefreshPayloadDto;

  @ApiProperty({
    description: 'Absolute expiry instant of the refresh token',
    type: String,
    format: 'date-time',
  })
  expiresAt!: Date;
}
