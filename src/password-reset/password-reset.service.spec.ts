import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';

describe('PasswordResetService (AC-13/14/15/17)', () => {
  const passwordResetTokenService = {
    create: jest.fn(),
    consume: jest.fn(),
  };
  const userClient = {
    findUserByEmail: jest.fn(),
    findUserById: jest.fn(),
    updateUserPrivateData: jest.fn(),
    verifyPassword: jest.fn(),
  };
  const notificationClient = {
    sendPasswordReset: jest.fn(),
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
      userClient as never,
      notificationClient as never,
      sessionService as never,
      twoFactorService as never,
    );
  });

  describe('forgotPassword (AC-14)', () => {
    it('returns without leaking when user is missing', async () => {
      userClient.findUserByEmail.mockRejectedValue(new Error('not found'));

      await expect(
        service.forgotPassword({ email: 'missing@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).not.toHaveBeenCalled();
      expect(notificationClient.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('returns without leaking when user is soft-deleted', async () => {
      userClient.findUserByEmail.mockRejectedValue(
        new ForbiddenException('Sign-in is unavailable for these credentials'),
      );

      await expect(
        service.forgotPassword({ email: 'gone@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).not.toHaveBeenCalled();
    });

    it('creates token and notifies when user exists', async () => {
      userClient.findUserByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.test',
      });
      passwordResetTokenService.create.mockResolvedValue({ token: 'tok' });
      notificationClient.sendPasswordReset.mockResolvedValue(undefined);

      await expect(
        service.forgotPassword({ email: 'user@example.test' }),
      ).resolves.toBeUndefined();

      expect(passwordResetTokenService.create).toHaveBeenCalledWith(
        'user@example.test',
      );
      expect(notificationClient.sendPasswordReset).toHaveBeenCalledWith({
        userId: 'u1',
        token: 'tok',
      });
    });

    it('fails closed when notification is down for a known user', async () => {
      userClient.findUserByEmail.mockResolvedValue({
        id: 'u1',
        email: 'user@example.test',
      });
      passwordResetTokenService.create.mockResolvedValue({ token: 'tok' });
      notificationClient.sendPasswordReset.mockRejectedValue(
        new Error('mail down'),
      );

      await expect(
        service.forgotPassword({ email: 'user@example.test' }),
      ).rejects.toThrow('mail down');
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
      ).rejects.toMatchObject({
        response: { code: 'auth.reset_code_invalid' },
      });

      expect(sessionService.signOutAll).not.toHaveBeenCalled();
    });

    it('updates password and revokes all sessions', async () => {
      passwordResetTokenService.consume.mockResolvedValue({
        email: 'user@example.test',
      });
      userClient.findUserByEmail.mockResolvedValueOnce({
        id: 'u1',
        email: 'user@example.test',
      });
      userClient.updateUserPrivateData.mockResolvedValueOnce(undefined);

      await service.resetPassword({
        token: 'good',
        newPassword: 'Passw0rd2',
      });

      expect(userClient.updateUserPrivateData).toHaveBeenCalledWith({
        userId: 'u1',
        password: 'Passw0rd2',
      });
      expect(sessionService.signOutAll).toHaveBeenCalledWith(
        'u1',
        'password-reset',
      );
    });
  });

  describe('changePassword (AC-14/15)', () => {
    it('rejects when current password is wrong, changing nothing and revoking nothing (AC-15)', async () => {
      userClient.findUserById.mockResolvedValueOnce({
        id: 'u1',
        twoFactorEnabled: false,
      });
      userClient.verifyPassword.mockResolvedValueOnce({ valid: false });

      await expect(
        service.changePassword({
          userId: 'u1',
          sessionId: 's1',
          currentPassword: 'wrong',
          newPassword: 'Passw0rd2',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(sessionService.signOutAll).not.toHaveBeenCalled();
      expect(userClient.updateUserPrivateData).not.toHaveBeenCalled();
    });

    it('requires 2FA code when enabled', async () => {
      userClient.findUserById.mockResolvedValueOnce({
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
      userClient.findUserById.mockResolvedValueOnce({
        id: 'u1',
        twoFactorEnabled: false,
      });
      userClient.verifyPassword.mockResolvedValueOnce({ valid: true });
      userClient.updateUserPrivateData.mockResolvedValueOnce(undefined);

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
