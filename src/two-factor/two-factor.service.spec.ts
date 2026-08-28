import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '../auth-error';
import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService (AC-10/AC-11)', () => {
  const twoFactorRepository = {
    createTwoFactorCode: jest.fn(),
    findTwoFactorCodeBySessionId: jest.fn(),
    updateTwoFactorCode: jest.fn(),
    deleteTwoFactorCode: jest.fn(),
    incrementUserFailedAttempts: jest.fn(),
    getUserFailedAttempts: jest.fn(),
  };
  const authService = {
    refreshAccessTokenBySessionId: jest.fn(),
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
    findActiveSessionByIdOrThrow: jest.fn(),
    updateTwoFactorVerifiedAt: jest.fn(),
  };

  let service: TwoFactorService;

  beforeEach(() => {
    jest.clearAllMocks();
    twoFactorRepository.getUserFailedAttempts.mockResolvedValue(0);
    service = new TwoFactorService(
      twoFactorRepository as never,
      authService as never,
      userService as never,
      notificationClient as never,
      sessionService as never,
    );
  });

  it('sends notification.send-two-factor after persisting a login code (AC-10)', async () => {
    sessionService.findActiveSessionByIdOrThrow.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      twoFactorVerifiedAt: null,
    });
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      twoFactorEnabled: true,
    });

    await service.sendCode({ sessionId: 's1' });

    expect(twoFactorRepository.createTwoFactorCode).toHaveBeenCalled();
    const notifyCall = notificationClient.sendAndReturnPromise.mock
      .calls[0] as [string, { userId: string; code: string; provider: string }];
    expect(notifyCall[0]).toBe('notification.send-two-factor');
    expect(notifyCall[1].userId).toBe('u1');
    expect(notifyCall[1].provider).toBe('EMAIL');
    expect(notifyCall[1].code).toMatch(/^\d{6}$/);
  });

  it('returns 429 with auth.two_factor_attempts_exceeded after 5 fails per User (AC-11)', async () => {
    twoFactorRepository.getUserFailedAttempts.mockResolvedValue(5);
    twoFactorRepository.findTwoFactorCodeBySessionId.mockResolvedValue({
      sessionId: 's1',
      code: '123456',
      attempts: 0,
    });

    await expect(
      service.verifyChallengeCode({
        sessionId: 's1',
        userId: 'u1',
        code: '000000',
        method: 'email',
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    try {
      await service.verifyChallengeCode({
        sessionId: 's1',
        userId: 'u1',
        code: '000000',
        method: 'email',
      });
    } catch (err) {
      expect((err as UnauthorizedException).getResponse()).toMatchObject({
        code: AuthErrorCode.twoFactorAttemptsExceeded,
      });
    }
    expect(
      twoFactorRepository.incrementUserFailedAttempts,
    ).not.toHaveBeenCalled();
  });

  it('returns 400 with auth.two_factor_code_invalid for a wrong code (AC-11)', async () => {
    twoFactorRepository.findTwoFactorCodeBySessionId.mockResolvedValue({
      sessionId: 's1',
      code: '123456',
      attempts: 0,
    });
    twoFactorRepository.incrementUserFailedAttempts.mockResolvedValue(1);

    try {
      await service.verifyChallengeCode({
        sessionId: 's1',
        userId: 'u1',
        code: '000000',
        method: 'email',
      });
      fail('expected invalid code error');
    } catch (err) {
      expect((err as { getStatus?: () => number }).getStatus?.()).toBe(400);
      expect((err as UnauthorizedException).getResponse()).toMatchObject({
        code: AuthErrorCode.twoFactorCodeInvalid,
      });
    }
    expect(
      twoFactorRepository.incrementUserFailedAttempts,
    ).toHaveBeenCalledWith('u1');
  });

  it('rejects an unavailable 2FA method (AC-10)', async () => {
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      twoFactorEnabled: true,
    });

    await expect(
      service.verifyChallengeCode({
        sessionId: 's1',
        userId: 'u1',
        code: '123456',
        method: 'totp',
      }),
    ).rejects.toThrow();
    try {
      await service.verifyChallengeCode({
        sessionId: 's1',
        userId: 'u1',
        code: '123456',
        method: 'totp',
      });
    } catch (err) {
      expect(
        (err as { getResponse: () => { code: string } }).getResponse(),
      ).toMatchObject({ code: AuthErrorCode.twoFactorCodeInvalid });
    }
  });
});
