import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '../auth-error';
import { SESSION_REFRESH_TTL_MS } from '../auth-challenge.constants';
import { CredentialsService } from './credentials.service';

describe('CredentialsService login (AC-07/08/10)', () => {
  const userService = {
    subscribeToResponseOf: jest.fn(),
    connect: jest.fn(),
    sendAndReturnPromise: jest.fn(),
  };
  const authService = {
    generateTokens: jest.fn().mockResolvedValue({
      accessToken: { token: 'a' },
      refreshToken: { token: 'r' },
    }),
  };
  const twoFactorService = { sendCode: jest.fn() };
  const sessionService = {
    createSession: jest.fn().mockResolvedValue({
      id: 's1',
      twoFactorVerifiedAt: null,
    }),
  };
  const emailVerificationService = { sendCode: jest.fn() };

  let service: CredentialsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CredentialsService(
      userService as never,
      authService as never,
      twoFactorService as never,
      sessionService as never,
      emailVerificationService as never,
    );
  });

  it('returns twoFactorChallenge and closed platform access when 2FA is on', async () => {
    userService.sendAndReturnPromise
      .mockResolvedValueOnce({
        id: 'u1',
        email: 'user-a1b2@example.test',
        firstName: 'T',
        lastName: 'U',
        username: 'u',
        displayName: null,
        bio: null,
        avatarUrl: null,
        bannerUrl: null,
        phoneNumber: null,
        accountId: null,
        emailVerifiedAt: new Date(),
        twoFactorEnabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .mockResolvedValueOnce(true);

    const result = await service.emailLogin({
      email: 'user-a1b2@example.test',
      password: 'Passw0rd1',
      userAgent: null,
      ipAddress: null,
    });

    expect(result.platformAccessOpen).toBe(false);
    expect(result.twoFactorChallenge?.required).toBe(true);
    expect(twoFactorService.sendCode).toHaveBeenCalledWith({ sessionId: 's1' });
    const sessionCalls = sessionService.createSession.mock.calls as unknown as [
      [{ expiresAt: Date; refreshAt: Date }],
    ];
    const created = sessionCalls[0][0];
    expect(created.expiresAt.getTime() - created.refreshAt.getTime()).toBe(
      SESSION_REFRESH_TTL_MS,
    );
  });

  it('maps miss, bad password, and soft-delete to 401 auth.sign_in_unavailable (AC-08)', async () => {
    userService.sendAndReturnPromise.mockResolvedValue(null);

    try {
      await service.emailLogin({
        email: 'missing@example.test',
        password: 'Passw0rd1',
        userAgent: null,
        ipAddress: null,
      });
      fail('expected unauthorized');
    } catch (err) {
      expect(err).toBeInstanceOf(UnauthorizedException);
      expect((err as UnauthorizedException).getResponse()).toMatchObject({
        code: AuthErrorCode.signInUnavailable,
      });
    }
  });

  it('maps soft-deleted user Forbidden to sign-in unavailable (AC-08)', async () => {
    userService.sendAndReturnPromise.mockRejectedValue(
      new ForbiddenException('Sign-in is unavailable for these credentials'),
    );

    await expect(
      service.emailLogin({
        email: 'user-a1b2@example.test',
        password: 'Passw0rd1',
        userAgent: null,
        ipAddress: null,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
