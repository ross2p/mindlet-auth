import { ForbiddenException } from '@nestjs/common';
import { computePlatformAccessOpen } from '../platform-access.util';
import { AuthErrorCode, authError } from '../auth-error';

export function assertRefreshAllowed(input: {
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: Date | null;
}): void {
  if (!computePlatformAccessOpen(input)) {
    throw new ForbiddenException(
      authError(
        AuthErrorCode.refreshBlockedPendingChallenge,
        'Complete verification before refreshing access',
      ),
    );
  }
}
