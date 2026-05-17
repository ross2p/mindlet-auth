import * as Joi from 'joi';
import type { DisableTwoFactorEnrollmentDto } from '../dto/disable-two-factor-enrollment.dto';

export const disableTwoFactorEnrollmentSchema =
  Joi.object<DisableTwoFactorEnrollmentDto>({
    password: Joi.string().trim().required().label('Password').messages({
      'any.required': `"Password" is required`,
    }),
  });
