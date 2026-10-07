import { AuthTwoFactorProto } from '@ross2p/common';
import type { TwoFactorChallengeDto } from '../token/types/token.types';

/**
 * Login-time method picker (AC-10). Setup lives in profile-and-settings;
 * auth only reports what is available for challenge. Email OTP is available
 * when 2FA is enabled; TOTP/backup stay disabled until profile exposes them.
 */
export function buildTwoFactorChallenge(input: {
  twoFactorEnabled: boolean;
  totpConfigured?: boolean;
  backupCodesAvailable?: boolean;
}): TwoFactorChallengeDto | null {
  if (!input.twoFactorEnabled) {
    return null;
  }
  return {
    required: true,
    methods: [
      { id: AuthTwoFactorProto.TwoFactorMethodId.email, available: true },
      {
        id: AuthTwoFactorProto.TwoFactorMethodId.totp,
        available: input.totpConfigured === true,
      },
      {
        id: AuthTwoFactorProto.TwoFactorMethodId.backup,
        available: input.backupCodesAvailable === true,
      },
    ],
  };
}
