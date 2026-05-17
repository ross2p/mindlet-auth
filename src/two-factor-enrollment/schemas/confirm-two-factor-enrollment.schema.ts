import * as Joi from 'joi';
import type { ConfirmTwoFactorEnrollmentDto } from '../dto/confirm-two-factor-enrollment.dto';

export const confirmTwoFactorEnrollmentSchema =
  Joi.object<ConfirmTwoFactorEnrollmentDto>({
    code: Joi.string()
      .trim()
      .pattern(/^\d{6}$/)
      .required()
      .label('Code')
      .messages({
        'string.pattern.base': `"Code" must be exactly 6 digits`,
        'any.required': `"Code" is required`,
      }),
  });
