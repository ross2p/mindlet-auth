import * as Joi from 'joi';
import type { RefreshTokenDto } from './refresh-token.dto';

export const refreshTokenSchema = Joi.object<RefreshTokenDto>({
  refreshToken: Joi.string().required(),
});
