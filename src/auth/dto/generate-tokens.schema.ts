import * as Joi from 'joi';
import type { GenerateTokensDto } from './generate-tokens.dto';

export const generateTokensSchema = Joi.object<GenerateTokensDto>({
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  sessionId: Joi.string().uuid().required(),
  twoFactorVerifiedAt: Joi.date().allow(null).optional().default(null),
  emailVerifiedAt: Joi.date().allow(null).optional().default(null),
  pendingVerification: Joi.boolean().optional(),
});
