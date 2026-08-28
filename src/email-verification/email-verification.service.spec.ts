import { ConflictException, BadRequestException } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';

describe('EmailVerificationService (AC-01/04/05/06)', () => {
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
  const emailVerificationRepository = {
    createEmailVerificationCode: jest.fn().mockResolvedValue({
      id: 'ev-1',
      userId: 'u1',
      code: '123456',
      attempts: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }),
    findEmailVerificationCodeByUserId: jest.fn(),
    deleteEmailVerificationCode: jest.fn(),
  };
  const authService = {
    refreshAccessTokenBySessionId: jest.fn().mockResolvedValue({
      token: 'access',
      payload: {},
      expiresAt: new Date(),
    }),
  };
  const sessionService = {
    findActiveSessionByIdOrThrow: jest.fn(),
  };

  let service: EmailVerificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EmailVerificationService(
      userService as never,
      notificationClient as never,
      emailVerificationRepository as never,
      authService as never,
      sessionService as never,
    );
  });

  it('persists a verification code on sendCode when email is unverified', async () => {
    sessionService.findActiveSessionByIdOrThrow.mockResolvedValue({
      id: 's1',
      userId: 'u1',
    });
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      email: 'user-a1b2@example.test',
      emailVerifiedAt: null,
    });

    const result = await service.sendCode({ sessionId: 's1' });

    const [createArgs] = emailVerificationRepository.createEmailVerificationCode
      .mock.calls[0] as [{ userId: string; code: string }];
    expect(createArgs.userId).toBe('u1');
    expect(createArgs.code).toMatch(/^\d{6}$/);
    expect(result).toEqual({
      id: 'ev-1',
      userId: 'u1',
      attempts: 0,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });
    expect(result).not.toHaveProperty('code');
    expect(notificationClient.sendAndReturnPromise).toHaveBeenCalled();
  });

  it('fails closed when notification is unavailable (AC-01)', async () => {
    sessionService.findActiveSessionByIdOrThrow.mockResolvedValue({
      id: 's1',
      userId: 'u1',
    });
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      email: 'user-a1b2@example.test',
      emailVerifiedAt: null,
    });
    notificationClient.sendAndReturnPromise.mockRejectedValue(
      new Error('mail down'),
    );

    await expect(service.sendCode({ sessionId: 's1' })).rejects.toThrow(
      'mail down',
    );
  });

  it('rejects sendCode when email already verified (AC-06)', async () => {
    sessionService.findActiveSessionByIdOrThrow.mockResolvedValue({
      id: 's1',
      userId: 'u1',
    });
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      emailVerifiedAt: new Date(),
    });

    await expect(service.sendCode({ sessionId: 's1' })).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejects invalid verification code (AC-05)', async () => {
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      emailVerifiedAt: null,
    });
    emailVerificationRepository.findEmailVerificationCodeByUserId.mockResolvedValue(
      { code: '123456', id: 'ev-1', attempts: 0 },
    );

    await expect(
      service.checkCode({
        id: 'ev-1',
        userId: 'u1',
        sessionId: 's1',
        email: 'user-a1b2@example.test',
        code: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks verified and refreshes tokens on valid code (AC-04)', async () => {
    userService.sendAndReturnPromise
      .mockResolvedValueOnce({
        id: 'u1',
        emailVerifiedAt: null,
      })
      .mockResolvedValueOnce({});
    emailVerificationRepository.findEmailVerificationCodeByUserId.mockResolvedValue(
      { code: '123456', id: 'ev-1', attempts: 0 },
    );

    await service.checkCode({
      id: 'ev-1',
      userId: 'u1',
      sessionId: 's1',
      email: 'user-a1b2@example.test',
      code: '123456',
    });

    expect(
      emailVerificationRepository.deleteEmailVerificationCode,
    ).toHaveBeenCalledWith('u1');
    expect(authService.refreshAccessTokenBySessionId).toHaveBeenCalledWith(
      's1',
    );
  });
});
