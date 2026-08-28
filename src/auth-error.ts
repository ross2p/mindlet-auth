/** Contract codes from docs/features/auth/contracts/openapi.yaml (mirror of @ross2p/types AuthErrorCode). */
export const AuthErrorCode = {
  passwordInvalid: 'auth.password_invalid',
  emailTaken: 'auth.email_taken',
  signInUnavailable: 'auth.sign_in_unavailable',
  verificationCodeInvalid: 'auth.verification_code_invalid',
  emailAlreadyVerified: 'auth.email_already_verified',
  twoFactorCodeInvalid: 'auth.two_factor_code_invalid',
  twoFactorAttemptsExceeded: 'auth.two_factor_attempts_exceeded',
  twoFactorNotRequired: 'auth.two_factor_not_required',
  refreshBlockedPendingChallenge: 'auth.refresh_blocked_pending_challenge',
  refreshExpired: 'auth.refresh_expired',
  resetCodeInvalid: 'auth.reset_code_invalid',
  passwordChangeRejected: 'auth.password_change_rejected',
  unauthorized: 'auth.unauthorized',
  rateLimited: 'auth.rate_limited',
} as const;

export type AuthErrorCodeValue =
  (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

export type AuthErrorBody = {
  code: AuthErrorCodeValue;
  message: string;
};

export function authError(
  code: AuthErrorCodeValue,
  message: string,
): AuthErrorBody {
  return { code, message };
}
