import { ApiProperty } from '@nestjs/swagger';
import type { TokenPayloadType } from '@ross2p/types';
import { UserPayloadDto } from './user-payload.dto';

export class TokenPayloadDto implements TokenPayloadType {
  @ApiProperty({
    description: 'Encoded JWT string',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description:
      'Decoded JWT payload including standard time claims when present',
    type: UserPayloadDto,
  })
  payload!: UserPayloadDto;

  @ApiProperty({
    description: 'Absolute expiry instant of the token',
    type: String,
    format: 'date-time',
  })
  expiresAt!: Date;
}
