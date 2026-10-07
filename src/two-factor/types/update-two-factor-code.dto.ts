import type { CreateTwoFactorCodeDto } from './create-two-factor-code.dto';

/** Selects the session challenge row; used to bump failed-attempt counter. */
export type UpdateTwoFactorCodeDto = Partial<CreateTwoFactorCodeDto> & {
  sessionId: string;
  attempts?: number;
};
