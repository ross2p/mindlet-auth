import * as Joi from 'joi';
import type { EmailVerificationEntity } from '../email-verification.entity';

export const emailVerificationEntitySchema =
  Joi.object<EmailVerificationEntity>({
    id: Joi.string().uuid().required().messages({
      'string.empty': `"ID" cannot be empty`,
      'string.guid': `"ID" must be a valid UUID`,
      'any.required': `"ID" is required`,
    }),

    userId: Joi.string().uuid().required().messages({
      'string.empty': `"User ID" cannot be empty`,
      'string.guid': `"User ID" must be a valid UUID`,
      'any.required': `"User ID" is required`,
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
