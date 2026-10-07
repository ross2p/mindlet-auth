import type { CreateSessionDto } from './create-session.dto';

export type UpdateSessionDto = Partial<CreateSessionDto> & {
  revokedAt?: Date | null;
  revokedReason?: string | null;
  refreshTokenHash?: string;
};
