import Joi from 'joi';
import { createUserSchema } from "@ross2p/types/dist/schemas/user/create-user.schema";

export const createUserFormSchema = (createUserSchema as Joi.ObjectSchema).keys({
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .messages({
      'any.only': 'Passwords do not match',
      'string.empty': 'Confirm password is required',
    }),
});