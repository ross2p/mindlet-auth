import Joi from "joi";

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .trim()
    .lowercase()
    .messages({
      "string.email": '"Email" must be a valid email address',
      "string.empty": '"Email" cannot be empty',
      "any.required": '"Email" is required',
    }),
});
