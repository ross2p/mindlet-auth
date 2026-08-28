/** Local mirror of @ross2p/types computePlatformAccessOpen until types package is bumped. */
export function computePlatformAccessOpen(input: {
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  twoFactorVerifiedAt: Date | null;
}): boolean {
  if (input.emailVerifiedAt == null) {
    return false;
  }
  if (input.twoFactorEnabled && input.twoFactorVerifiedAt == null) {
    return false;
  }
  return true;
}
