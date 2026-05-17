import * as Joi from 'joi';
import type { ForgotPasswordDto } from './forgot-password.dto';

export const forgotPasswordSchema = Joi.object<ForgotPasswordDto>({
  email: Joi.string().email().required(),
});
