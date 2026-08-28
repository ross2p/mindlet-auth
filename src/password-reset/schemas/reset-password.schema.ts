import * as Joi from 'joi';

const passwordRule = Joi.string()
  .trim()
  .min(8)
  .max(128)
  .pattern(new RegExp('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]+$'))
  .messages({
    'string.pattern.base': `"Password" must contain at least one letter and one number`,
    'string.min': `"Password" must be at least {#limit} characters`,
    'string.max': `"Password" must be at most {#limit} characters`,
    'string.empty': `"Password" cannot be empty`,
  });

type ResetPasswordInput = {
  token: string;
  password?: string;
  newPassword?: string;
};

/** Accepts OpenAPI `password` and as-built `newPassword`. */
export const resetPasswordPortSchema = Joi.object<ResetPasswordInput>({
  token: Joi.string().required().label('Token').messages({
    'string.empty': `"Token" cannot be empty`,
    'any.required': `"Token" is required`,
  }),
  password: passwordRule.label('Password'),
  newPassword: passwordRule.label('New Password'),
})
  .or('password', 'newPassword')
  .custom((value: ResetPasswordInput) => ({
    token: value.token,
    newPassword: value.newPassword ?? value.password,
  }));
