import { ForbiddenException } from '@nestjs/common';
import { computePlatformAccessOpen } from '../platform-access.util';

export function assertRefreshAllowed(input: {
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: Date | null;
}): void {
  if (!computePlatformAccessOpen(input)) {
    throw new ForbiddenException(
      'Complete verification before refreshing access',
    );
  }
}
