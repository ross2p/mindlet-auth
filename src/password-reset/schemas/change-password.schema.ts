import * as Joi from 'joi';

/** Local schema until published in @ross2p/types (T9 ports). */
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().label('Current Password').messages({
    'string.empty': `"Current Password" cannot be empty`,
    'any.required': `"Current Password" is required`,
  }),
  newPassword: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$'))
    .label('New Password')
    .messages({
      'string.pattern.base': `"New Password" must contain at least one letter and one number`,
      'string.min': `"New Password" must be at least {#limit} characters`,
      'string.max': `"New Password" must be at most {#limit} characters`,
      'string.empty': `"New Password" cannot be empty`,
      'any.required': `"New Password" is required`,
    }),
  twoFactorMethod: Joi.string()
    .valid('email', 'totp', 'backup')
    .allow(null)
    .optional(),
  twoFactorCode: Joi.string().max(12).allow(null, '').optional(),
});
