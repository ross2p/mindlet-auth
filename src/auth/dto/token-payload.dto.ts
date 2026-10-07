import type { TokenPayloadType } from '@ross2p/types';
import { UserPayloadDto } from './user-payload.dto';

export class TokenPayloadDto implements TokenPayloadType {
  token!: string;

  payload!: UserPayloadDto;

  expiresAt!: Date;
}
