import { PartialType } from '@nestjs/mapped-types';
import { CreateTwoFactorCodeDto } from './create-two-factor-code.dto';

/** Selects the session challenge row; used to bump failed-attempt counter. */
export class UpdateTwoFactorCodeDto extends PartialType(
  CreateTwoFactorCodeDto,
) {
  override sessionId: string;
  attempts?: number;
}
