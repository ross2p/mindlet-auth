import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { TwoFactorMethodService } from './two-factor-method.service';

describe('TwoFactorMethodService (AC-18/19/30/31/32)', () => {
  const enrollmentService = {
    createChallenge: jest.fn(),
    verifyChallenge: jest.fn(),
  };
  const methodRepository = {
    setEnabled: jest.fn(),
    findActiveByUserId: jest.fn(),
    findByUserAndType: jest.fn(),
  };
  const backupCodeService = {
    issueCodes: jest.fn(),
    consume: jest.fn(),
  };
  const reauthService = {
    isVerified: jest.fn(),
    markVerified: jest.fn(),
  };
  const userClient = { sendAndReturnPromise: jest.fn(), emitEvent: jest.fn() };
  const notificationClient = {
    sendTwoFactor: jest.fn(),
  };

  let service: TwoFactorMethodService;

  beforeEach(() => {
    jest.clearAllMocks();
    backupCodeService.issueCodes.mockResolvedValue(
      Array.from({ length: 10 }, (_, i) => `CODE${i}`),
    );
    service = new TwoFactorMethodService(
      enrollmentService as never,
      methodRepository as never,
      backupCodeService as never,
      reauthService as never,
      userClient as never,
      notificationClient as never,
    );
  });

  describe('confirmEnable', () => {
    it('first-ever enable issues Backup codes once and mirrors 2FA on (AC-18)', async () => {
      enrollmentService.verifyChallenge.mockResolvedValue(undefined);
      methodRepository.findActiveByUserId.mockResolvedValue([]);

      const result = await service.confirmEnable('u1', 'EMAIL_CODE', '111111');

      expect(methodRepository.setEnabled).toHaveBeenCalledWith(
        'u1',
        'EMAIL_CODE',
        true,
      );
      expect(backupCodeService.issueCodes).toHaveBeenCalledWith('u1');
      expect(result.backupCodes).toHaveLength(10);
      expect(userClient.emitEvent).toHaveBeenCalledWith(
        'auth.account.two_factor.enabled',
        { userId: 'u1' },
      );
    });

    it('a second method enable does not reissue Backup codes', async () => {
      enrollmentService.verifyChallenge.mockResolvedValue(undefined);
      methodRepository.findActiveByUserId.mockResolvedValue([
        { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
      ]);

      const result = await service.confirmEnable('u1', 'EMAIL_CODE', '111111');

      expect(backupCodeService.issueCodes).not.toHaveBeenCalled();
      expect(result.backupCodes).toBeUndefined();
    });
  });

  describe('disable', () => {
    it('requires Re-authentication to disable the last active method (AC-19)', async () => {
      methodRepository.findActiveByUserId.mockResolvedValue([
        { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
      ]);
      reauthService.isVerified.mockResolvedValue(false);

      await expect(service.disable('u1', 'EMAIL_CODE')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(methodRepository.setEnabled).not.toHaveBeenCalled();
    });

    it('disables the last method and mirrors 2FA off once re-authenticated', async () => {
      methodRepository.findActiveByUserId.mockResolvedValue([
        { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
      ]);
      reauthService.isVerified.mockResolvedValue(true);

      await service.disable('u1', 'EMAIL_CODE');

      expect(methodRepository.setEnabled).toHaveBeenCalledWith(
        'u1',
        'EMAIL_CODE',
        false,
      );
      expect(userClient.emitEvent).toHaveBeenCalledWith(
        'auth.account.two_factor.disabled',
        { userId: 'u1' },
      );
    });

    it('disables a non-last method without requiring Re-authentication (AC-30)', async () => {
      methodRepository.findActiveByUserId.mockResolvedValue([
        { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
        { id: 'm2', userId: 'u1', type: 'TOTP', enabled: true },
      ]);

      await service.disable('u1', 'EMAIL_CODE');

      expect(reauthService.isVerified).not.toHaveBeenCalled();
      expect(methodRepository.setEnabled).toHaveBeenCalledWith(
        'u1',
        'EMAIL_CODE',
        false,
      );
      expect(userClient.emitEvent).not.toHaveBeenCalled();
    });
  });

  describe('regenerateBackupCodes', () => {
    it('requires Re-authentication (AC-31)', async () => {
      reauthService.isVerified.mockResolvedValue(false);

      await expect(service.regenerateBackupCodes('u1')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );

      expect(backupCodeService.issueCodes).not.toHaveBeenCalled();
    });

    it('invalidates the old set and issues a new one exactly once', async () => {
      reauthService.isVerified.mockResolvedValue(true);

      const result = await service.regenerateBackupCodes('u1');

      expect(backupCodeService.issueCodes).toHaveBeenCalledWith('u1');
      expect(result.backupCodes).toHaveLength(10);
    });
  });

  describe('listMethods', () => {
    it('returns the active methods for a user', async () => {
      methodRepository.findActiveByUserId.mockResolvedValue([
        { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
      ]);

      const result = await service.listMethods('u1');

      expect(methodRepository.findActiveByUserId).toHaveBeenCalledWith('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('consumeBackupCodeForReauth', () => {
    it('rejects when no unused code matches', async () => {
      backupCodeService.consume.mockResolvedValue(false);

      await expect(
        service.consumeBackupCodeForReauth('u1', 'WRONG-CODE'),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(reauthService.markVerified).not.toHaveBeenCalled();
    });
  });
});
