import * as Joi from 'joi';
import type { AccessTokenDto } from './access-token.dto';

export const accessTokenSchema = Joi.object<AccessTokenDto>({
  accessToken: Joi.string().required().label('Access Token').messages({
    'string.base': `"Access Token" must be a string`,
    'any.required': `"Access Token" is a required field`,
  }),
});
