import * as Joi from 'joi';
import type { TwoFactorEntity } from '../two-factor.entity';

export const twoFactorEntitySchema = Joi.object<TwoFactorEntity>({
  sessionId: Joi.string().uuid().required().messages({
    'string.empty': `"Session ID" cannot be empty`,
    'string.guid': `"Session ID" must be a valid UUID`,
    'any.required': `"Session ID" is required`,
  }),

  code: Joi.string()
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      'string.pattern.base': `"Code" must be a 6-digit string`,
      'any.required': `"Code" is required`,
    }),

  attempts: Joi.number().integer().min(0).required().messages({
    'number.base': `"Attempts" must be a number`,
    'number.integer': `"Attempts" must be an integer`,
    'number.min': `"Attempts" cannot be negative`,
    'any.required': `"Attempts" is required`,
  }),

  createdAt: Joi.date().required().messages({
    'date.base': `"Created at" must be a valid date`,
    'any.required': `"Created at" is required`,
  }),

  updatedAt: Joi.date().required().messages({
    'date.base': `"Updated at" must be a valid date`,
    'any.required': `"Updated at" is required`,
  }),
});
