import Joi from "joi";

/** Shared schema for 6-digit OTP codes (email-verification and 2FA challenge). */
export const verifyCodeSchema = Joi.object({
  code: Joi.string()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.length": "Code must be exactly 6 digits",
      "string.pattern.base": "Code must contain digits only",
      "string.empty": "Code is required",
      "any.required": "Code is required",
    }),
});
