import Joi from "joi";

export const resetPasswordFormSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": '"Token" cannot be empty',
    "any.required": '"Token" is required',
  }),
  newPassword: Joi.string()
    .required()
    .trim()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/)
    .messages({
      "string.pattern.base":
        '"New Password" must contain at least one letter and one number',
      "string.min": '"New Password" must be at least {#limit} characters',
      "string.max": '"New Password" must be at most {#limit} characters',
      "string.empty": '"New Password" cannot be empty',
      "any.required": '"New Password" is required',
    }),
  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref("newPassword"))
    .messages({
      "any.only": "Passwords do not match",
      "string.empty": "Confirm password is required",
      "any.required": "Confirm password is required",
    }),
});
