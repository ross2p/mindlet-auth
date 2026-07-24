import { ForbiddenException } from '@nestjs/common';
import { assertRefreshAllowed } from './refresh-gate.util';

describe('refresh gate (AC-09/12/18)', () => {
  it('blocks refresh when email is not verified', () => {
    expect(() =>
      assertRefreshAllowed({
        emailVerifiedAt: null,
        twoFactorEnabled: false,
        twoFactorVerifiedAt: null,
      }),
    ).toThrow(ForbiddenException);
  });

  it('blocks refresh when 2FA is pending', () => {
    expect(() =>
      assertRefreshAllowed({
        emailVerifiedAt: new Date(),
        twoFactorEnabled: true,
        twoFactorVerifiedAt: null,
      }),
    ).toThrow(ForbiddenException);
  });

  it('allows refresh when platform access is open', () => {
    expect(() =>
      assertRefreshAllowed({
        emailVerifiedAt: new Date(),
        twoFactorEnabled: true,
        twoFactorVerifiedAt: new Date(),
      }),
    ).not.toThrow();
  });
});
