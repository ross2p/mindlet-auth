import * as Joi from 'joi';
import type { VerifyTwoFactorCodeDto } from './verify-two-factor-code.dto';

export const verifyTwoFactorCodeSchema = Joi.object<VerifyTwoFactorCodeDto>({
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required(),
});
