import { PartialType } from '@nestjs/swagger';
import { CreateSessionDto } from './create-session.dto';

export class UpdateSessionDto extends PartialType(CreateSessionDto) {
  revokedAt?: Date | null;
  revokedReason?: string | null;
  refreshTokenHash?: string;
}
