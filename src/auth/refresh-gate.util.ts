import { computePlatformAccessOpen } from '../platform-access.util';
import { RefreshBlockedPendingChallenge } from '../auth.exceptions';

export function assertRefreshAllowed(input: {
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: Date | null;
}): void {
  if (!computePlatformAccessOpen(input)) {
    throw new RefreshBlockedPendingChallenge();
  }
}
