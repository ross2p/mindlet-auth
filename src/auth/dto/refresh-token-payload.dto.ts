import type { RefreshTokenPayloadType } from '@ross2p/types';
import { RefreshPayloadDto } from './refresh-payload.dto';

export class RefreshTokenPayloadDto implements RefreshTokenPayloadType {
  token!: string;

  payload!: RefreshPayloadDto;

  expiresAt!: Date;
}
