import { TwoFactorMethodMessageController } from './two-factor-method-message.controller';

describe('TwoFactorMethodMessageController wiring (AC-18/19/30/31/32)', () => {
  const twoFactorMethodService = {
    listMethods: jest.fn(),
    beginEnable: jest.fn(),
    confirmEnable: jest.fn(),
    disable: jest.fn(),
    regenerateBackupCodes: jest.fn(),
  };
  const controller = new TwoFactorMethodMessageController(
    twoFactorMethodService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards list requests', async () => {
    await controller.listMethodsEvent({ userId: 'u1' });
    expect(twoFactorMethodService.listMethods).toHaveBeenCalledWith('u1');
  });

  it('forwards begin-enable requests', async () => {
    await controller.beginEnableEvent({ userId: 'u1', type: 'EMAIL_CODE' });
    expect(twoFactorMethodService.beginEnable).toHaveBeenCalledWith(
      'u1',
      'EMAIL_CODE',
    );
  });

  it('forwards confirm-enable requests', async () => {
    await controller.confirmEnableEvent({
      userId: 'u1',
      type: 'EMAIL_CODE',
      code: '111111',
    });
    expect(twoFactorMethodService.confirmEnable).toHaveBeenCalledWith(
      'u1',
      'EMAIL_CODE',
      '111111',
    );
  });

  it('forwards disable requests', async () => {
    await controller.disableEvent({ userId: 'u1', type: 'EMAIL_CODE' });
    expect(twoFactorMethodService.disable).toHaveBeenCalledWith(
      'u1',
      'EMAIL_CODE',
    );
  });

  it('forwards regenerate requests', async () => {
    await controller.regenerateBackupCodesEvent({ userId: 'u1' });
    expect(twoFactorMethodService.regenerateBackupCodes).toHaveBeenCalledWith(
      'u1',
    );
  });
});
