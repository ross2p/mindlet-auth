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
    createEmailVerificationCode: jest.fn(),
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

    await service.sendCode({ sessionId: 's1' });

    expect(
      emailVerificationRepository.createEmailVerificationCode,
    ).toHaveBeenCalledWith('u1', expect.stringMatching(/^\d{6}$/));
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
      { code: '123456', attempts: 0 },
    );

    await expect(
      service.checkCode({
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
      { code: '123456', attempts: 0 },
    );

    await service.checkCode({
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
