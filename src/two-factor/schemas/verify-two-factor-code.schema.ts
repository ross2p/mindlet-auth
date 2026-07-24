import * as Joi from 'joi';

export const verifyTwoFactorCodeSchema = Joi.object({
  method: Joi.string().valid('email', 'totp', 'backup').required().messages({
    'any.required': `"Method" is required`,
    'any.only': `"Method" must be one of email, totp, backup`,
  }),
  code: Joi.string().trim().min(6).max(12).required().label('Code').messages({
    'string.empty': `"Code" cannot be empty`,
    'any.required': `"Code" is required`,
  }),
});
