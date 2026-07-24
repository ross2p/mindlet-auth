import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService (AC-13/14/15/17)', () => {
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
    sendAndReturnPromise: jest.fn(),
  };
  const sessionService = {
    signOutAll: jest.fn(),
  };
  const twoFactorService = {
    verifyChallengeCode: jest.fn(),
  };

  let service: PasswordResetService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PasswordResetService(
      passwordResetTokenService as never,
      userService as never,
      notificationClient as never,
      sessionService as never,
      twoFactorService as never,
    );
  });

  describe('forgotPassword (AC-14)', () => {
    it('returns without leaking when user is missing', async () => {
      userService.sendAndReturnPromise.mockRejectedValue(
        new Error('not found'),
      );

      await expect(
        service.forgotPassword({ email: 'missing@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).not.toHaveBeenCalled();
      expect(notificationClient.sendAndReturnPromise).not.toHaveBeenCalled();
    });

    it('returns without leaking when user is soft-deleted', async () => {
      userService.sendAndReturnPromise.mockRejectedValue(
        new ForbiddenException('Sign-in is unavailable for these credentials'),
      );

      await expect(
        service.forgotPassword({ email: 'gone@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).not.toHaveBeenCalled();
    });

    it('creates token and notifies when user exists', async () => {
      userService.sendAndReturnPromise.mockResolvedValue({
        id: 'u1',
        email: 'user@example.test',
      });
      passwordResetTokenService.create.mockResolvedValue({ token: 'tok' });
      notificationClient.sendAndReturnPromise.mockResolvedValue(undefined);

      await expect(
        service.forgotPassword({ email: 'user@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).toHaveBeenCalledWith(
        'user@example.test',
      );
      expect(notificationClient.sendAndReturnPromise).toHaveBeenCalledWith(
        'email.send-password-reset',
        { userId: 'u1', token: 'tok' },
      );
    });
  });

  describe('resetPassword (AC-13/15)', () => {
    it('rejects invalid or expired token', async () => {
      passwordResetTokenService.consume.mockRejectedValue(
        new BadRequestException('Invalid or expired password reset token'),
      );

      await expect(
        service.resetPassword({
          token: 'bad',
          newPassword: 'Passw0rd2',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(sessionService.signOutAll).not.toHaveBeenCalled();
    });

    it('updates password and revokes all sessions', async () => {
      passwordResetTokenService.consume.mockResolvedValue({
        email: 'user@example.test',
      });
      userService.sendAndReturnPromise
        .mockResolvedValueOnce({ id: 'u1', email: 'user@example.test' })
        .mockResolvedValueOnce(undefined);

      await service.resetPassword({
        token: 'good',
        newPassword: 'Passw0rd2',
      });

      expect(userService.sendAndReturnPromise).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        { userId: 'u1', password: 'Passw0rd2' },
      );
      expect(sessionService.signOutAll).toHaveBeenCalledWith(
        'u1',
        'password-reset',
      );
    });
  });

  describe('changePassword (AC-17)', () => {
    it('rejects when current password is wrong', async () => {
      userService.sendAndReturnPromise
        .mockResolvedValueOnce({
          id: 'u1',
          twoFactorEnabled: false,
        })
        .mockResolvedValueOnce(false);

      await expect(
        service.changePassword({
          userId: 'u1',
          sessionId: 's1',
          currentPassword: 'wrong',
          newPassword: 'Passw0rd2',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(sessionService.signOutAll).not.toHaveBeenCalled();
    });

    it('requires 2FA code when enabled', async () => {
      userService.sendAndReturnPromise.mockResolvedValueOnce({
        id: 'u1',
        twoFactorEnabled: true,
      });

      await expect(
        service.changePassword({
          userId: 'u1',
          sessionId: 's1',
          currentPassword: 'Passw0rd1',
          newPassword: 'Passw0rd2',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('updates password and revokes all sessions', async () => {
      userService.sendAndReturnPromise
        .mockResolvedValueOnce({
          id: 'u1',
          twoFactorEnabled: false,
        })
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(undefined);

      await service.changePassword({
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
  });
});
