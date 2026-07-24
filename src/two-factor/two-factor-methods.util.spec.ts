import { buildTwoFactorChallenge } from './two-factor-methods.util';

describe('buildTwoFactorChallenge (AC-10)', () => {
  it('returns null when 2FA is off (AC-07 path)', () => {
    expect(buildTwoFactorChallenge({ twoFactorEnabled: false })).toBeNull();
  });

  it('lists email available and totp/backup disabled by default', () => {
    const challenge = buildTwoFactorChallenge({ twoFactorEnabled: true });
    expect(challenge).toEqual({
      required: true,
      methods: [
        { id: 'email', available: true },
        { id: 'totp', available: false },
        { id: 'backup', available: false },
      ],
    });
  });

  it('marks backup available only when already generated in profile', () => {
    const challenge = buildTwoFactorChallenge({
      twoFactorEnabled: true,
      backupCodesAvailable: true,
    });
    expect(challenge?.methods.find((m) => m.id === 'backup')?.available).toBe(
      true,
    );
  });
});
