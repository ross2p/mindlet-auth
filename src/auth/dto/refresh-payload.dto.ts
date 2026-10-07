import type { RefreshPayload } from '@ross2p/types';

export class RefreshPayloadDto implements RefreshPayload {
  id!: string;

  sessionId!: string;

  type!: 'refresh';

  iat?: number;

  exp?: number;
}
