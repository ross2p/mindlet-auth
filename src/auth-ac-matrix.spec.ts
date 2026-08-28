/**
 * AC matrix — mocked integration suite (runs without Docker).
 * Covers the happy-path chain from test-plan.md when ephemeral Postgres/Redis
 * are unavailable. Full HTTP e2e: see test/auth-ac-matrix.e2e-spec.ts.
 */
import { ForbiddenException } from '@nestjs/common';
import { computePlatformAccessOpen } from './platform-access.util';
import { assertRefreshAllowed } from './auth/refresh-gate.util';
import { buildTwoFactorChallenge } from './two-factor/two-factor-methods.util';
import { isTwoFactorAttemptsExceeded } from './auth-challenge.constants';
import { AuthErrorCode } from './auth-error';
import { PasswordResetService } from './password-reset/password-reset.service';
import { CredentialsService } from './credentials/credentials.service';
import { SessionService } from './session/session.service';

describe('Auth AC matrix (unit / mocked integration)', () => {
  const verifiedAt = new Date('2026-07-24T10:00:00.000Z');

  describe('AC-01 / AC-04 — register → verify unlocks gate', () => {
    it('keeps platform access closed until email is verified', () => {
      expect(
        computePlatformAccessOpen({
          emailVerifiedAt: null,
          twoFactorEnabled: false,
          twoFactorVerifiedAt: verifiedAt,
        }),
      ).toBe(false);
    });

    it('opens platform access after email verify when 2FA is off', () => {
      expect(
        computePlatformAccessOpen({
          emailVerifiedAt: verifiedAt,
          twoFactorEnabled: false,
          twoFactorVerifiedAt: verifiedAt,
        }),
      ).toBe(true);
    });
  });

  describe('AC-07 / AC-10 — login ± 2FA on same Session', () => {
    it('returns method picker when 2FA is enabled', () => {
      const challenge = buildTwoFactorChallenge({ twoFactorEnabled: true });
      expect(challenge?.required).toBe(true);
      expect(challenge?.methods.find((m) => m.id === 'email')?.available).toBe(
        true,
      );
      expect(challenge?.methods.find((m) => m.id === 'totp')?.available).toBe(
        false,
      );
    });

    it('keeps access closed while 2FA challenge is pending', () => {
      expect(
        computePlatformAccessOpen({
          emailVerifiedAt: verifiedAt,
          twoFactorEnabled: true,
          twoFactorVerifiedAt: null,
        }),
      ).toBe(false);
    });

    it('opens access after 2FA verified on the same session', () => {
      expect(
        computePlatformAccessOpen({
          emailVerifiedAt: verifiedAt,
          twoFactorEnabled: true,
          twoFactorVerifiedAt: verifiedAt,
        }),
      ).toBe(true);
    });
  });

  describe('AC-09 / AC-12 / AC-18 — refresh gates', () => {
    it('blocks refresh before email verify (AC-09)', () => {
      expect(() =>
        assertRefreshAllowed({
          emailVerifiedAt: null,
          twoFactorEnabled: false,
          twoFactorVerifiedAt: null,
        }),
      ).toThrow(ForbiddenException);
    });

    it('blocks refresh while 2FA pending (AC-12) with contract code', () => {
      try {
        assertRefreshAllowed({
          emailVerifiedAt: verifiedAt,
          twoFactorEnabled: true,
          twoFactorVerifiedAt: null,
        });
        fail('expected ForbiddenException');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
        expect((err as ForbiddenException).getResponse()).toMatchObject({
          code: AuthErrorCode.refreshBlockedPendingChallenge,
        });
      }
    });

    it('allows refresh after unlock (AC-18)', () => {
      expect(() =>
        assertRefreshAllowed({
          emailVerifiedAt: verifiedAt,
          twoFactorEnabled: true,
          twoFactorVerifiedAt: verifiedAt,
        }),
      ).not.toThrow();
    });
  });

  describe('AC-11 — 2FA attempt ceiling', () => {
    it('treats 5 failed attempts as exceeded', () => {
      expect(isTwoFactorAttemptsExceeded(4)).toBe(false);
      expect(isTwoFactorAttemptsExceeded(5)).toBe(true);
    });
  });

  describe('AC-13 / AC-14 / AC-16 / AC-17 — reset, forgot, sign-out, change', () => {
    const passwordResetTokenService = {
      create: jest.fn(),
      consume: jest.fn(),
    };
    const userService = {
      subscribeToResponseOf: jest.fn(),
      connect: jest.fn(),
      sendAndReturnPromise: jest.fn(),
    };
    const notificationClient = {
      subscribeToResponseOf: jest.fn(),
      connect: jest.fn(),
      sendAndReturnPromise: jest.fn().mockResolvedValue(undefined),
    };
    const sessionService = {
      signOutAll: jest.fn(),
    };
    const twoFactorService = {
      verifyChallengeCode: jest.fn(),
    };

    let resetService: PasswordResetService;

    beforeEach(() => {
      jest.clearAllMocks();
      resetService = new PasswordResetService(
        passwordResetTokenService as never,
        userService as never,
        notificationClient as never,
        sessionService as never,
        twoFactorService as never,
      );
    });

    it('AC-14 — forgot succeeds identically for missing users', async () => {
      userService.sendAndReturnPromise.mockRejectedValue(new Error('missing'));
      await expect(
        resetService.forgotPassword({ email: 'missing@example.test' }),
      ).resolves.toBeUndefined();
      expect(passwordResetTokenService.create).not.toHaveBeenCalled();
    });

    it('AC-13 — reset updates password and revokes all sessions', async () => {
      passwordResetTokenService.consume.mockResolvedValue({
        email: 'user-a1b2@example.test',
      });
      userService.sendAndReturnPromise
        .mockResolvedValueOnce({ id: 'u1', email: 'user-a1b2@example.test' })
        .mockResolvedValueOnce(undefined);

      await resetService.resetPassword({
        token: 'tok',
        newPassword: 'Passw0rd2',
      });

      expect(sessionService.signOutAll).toHaveBeenCalledWith(
        'u1',
        'password-reset',
      );
    });

    it('AC-17 — change password revokes all sessions', async () => {
      userService.sendAndReturnPromise
        .mockResolvedValueOnce({ id: 'u1', twoFactorEnabled: false })
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(undefined);

      await resetService.changePassword({
        userId: 'u1',
        sessionId: 's1',
        currentPassword: 'Passw0rd1',
        newPassword: 'Passw0rd2',
      });

      expect(sessionService.signOutAll).toHaveBeenCalledWith(
        'u1',
        'password-change',
      );
    });

    it('AC-16 — sign-out revokes only the current session', async () => {
      const sessionRepository = {
        findSessionById: jest.fn().mockResolvedValue({
          id: 's1',
          userId: 'u1',
          revokedAt: null,
        }),
        updateSession: jest.fn().mockResolvedValue({
          id: 's1',
          revokedAt: new Date(),
          revokedReason: 'sign-out',
        }),
        bulkUpdateSessionsByUserId: jest.fn(),
      };
      const userEventClient = { emitEvent: jest.fn() };
      const sessions = new SessionService(
        sessionRepository as never,
        userEventClient as never,
      );

      await sessions.signOut('u1', 's1', 'sign-out');

      expect(sessionRepository.updateSession).toHaveBeenCalled();
      expect(
        sessionRepository.bulkUpdateSessionsByUserId,
      ).not.toHaveBeenCalled();
    });
  });

  describe('AC-08 — soft-delete denied at login', () => {
    it('maps Forbidden from user identity to sign-in unavailable', async () => {
      const userService = {
        subscribeToResponseOf: jest.fn(),
        connect: jest.fn(),
        sendAndReturnPromise: jest
          .fn()
          .mockRejectedValue(
            new ForbiddenException(
              'Sign-in is unavailable for these credentials',
            ),
          ),
      };
      const credentials = new CredentialsService(
        userService as never,
        { generateTokens: jest.fn() } as never,
        { sendCode: jest.fn() } as never,
        { createSession: jest.fn() } as never,
        { sendCode: jest.fn() } as never,
      );

      await expect(
        credentials.emailLogin({
          email: 'gone@example.test',
          password: 'Passw0rd1',
          userAgent: null,
          ipAddress: null,
        }),
      ).rejects.toThrow();
      try {
        await credentials.emailLogin({
          email: 'gone@example.test',
          password: 'Passw0rd1',
          userAgent: null,
          ipAddress: null,
        });
      } catch (err) {
        expect(
          (err as { getResponse: () => { code: string } }).getResponse(),
        ).toMatchObject({ code: 'auth.sign_in_unavailable' });
      }
    });
  });
});
