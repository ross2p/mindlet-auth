import type { TwoFactorChallengeType } from '@ross2p/types';

/**
 * Login-time method picker (AC-10). Setup lives in profile-and-settings;
 * auth only reports what is available for challenge. Email OTP is available
 * when 2FA is enabled; TOTP/backup stay disabled until profile exposes them.
 */
export function buildTwoFactorChallenge(input: {
  twoFactorEnabled: boolean;
  totpConfigured?: boolean;
  backupCodesAvailable?: boolean;
}): TwoFactorChallengeType | null {
  if (!input.twoFactorEnabled) {
    return null;
  }
  return {
    required: true,
    methods: [
      { id: 'email', available: true },
      { id: 'totp', available: input.totpConfigured === true },
      { id: 'backup', available: input.backupCodesAvailable === true },
    ],
  };
}
