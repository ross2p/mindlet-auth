import { JwtService } from '@nestjs/jwt';
import { UserAccessTokenService } from './user-access-token.service';

describe('UserAccessTokenService', () => {
  const service = new UserAccessTokenService(
    new JwtService({
      secret: 'test-secret',
      signOptions: { expiresIn: '15m' },
    }),
  );
  const verifiedAt = new Date('2026-10-30T10:00:00.000Z');
  const payload = {
    id: 'user-1',
    email: 'a@b.test',
    sessionId: 'session-1',
    twoFactorVerifiedAt: verifiedAt,
    emailVerifiedAt: null,
  };

  it('returns the payload dates as Date, not the ISO strings the JWT carries', () => {
    const generated = service.generateToken(payload);
    expect(generated.payload.twoFactorVerifiedAt).toEqual(verifiedAt);
    expect(generated.payload.emailVerifiedAt).toBeNull();

    const verified = service.verifyToken(generated.token);
    expect(verified.twoFactorVerifiedAt).toEqual(verifiedAt);
    expect(verified.emailVerifiedAt).toBeNull();
  });
});
