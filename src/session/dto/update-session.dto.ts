import { PartialType } from '@nestjs/mapped-types';
import { CreateSessionDto } from './create-session.dto';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  revokedAt?: Date | null;
  revokedReason?: string | null;
  refreshTokenHash?: string;
}
