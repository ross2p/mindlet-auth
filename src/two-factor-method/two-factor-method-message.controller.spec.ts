import { AuthTwoFactorMethodProto } from '@ross2p/common';
import { TwoFactorMethodMessageController } from './two-factor-method-message.controller';

const USER_ID = '018f0000-0000-7000-8000-000000000001';

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
    twoFactorMethodService.listMethods.mockResolvedValue([]);
    await controller.listTwoFactorMethods({ userId: USER_ID });
    expect(twoFactorMethodService.listMethods).toHaveBeenCalledWith(USER_ID);
  });

  it('forwards begin-enable requests', async () => {
    await controller.beginEnableTwoFactorMethod({
      userId: USER_ID,
      type: AuthTwoFactorMethodProto.SecondFactorMethodType.EMAIL_CODE,
    });
    expect(twoFactorMethodService.beginEnable).toHaveBeenCalledWith(
      USER_ID,
      'EMAIL_CODE',
    );
  });

  it('forwards confirm-enable requests', async () => {
    twoFactorMethodService.confirmEnable.mockResolvedValue({});
    await controller.confirmEnableTwoFactorMethod({
      userId: USER_ID,
      type: AuthTwoFactorMethodProto.SecondFactorMethodType.EMAIL_CODE,
      code: '111111',
    });
    expect(twoFactorMethodService.confirmEnable).toHaveBeenCalledWith(
      USER_ID,
      'EMAIL_CODE',
      '111111',
    );
  });

  it('forwards disable requests', async () => {
    await controller.disableTwoFactorMethod({
      userId: USER_ID,
      type: AuthTwoFactorMethodProto.SecondFactorMethodType.EMAIL_CODE,
    });
    expect(twoFactorMethodService.disable).toHaveBeenCalledWith(
      USER_ID,
      'EMAIL_CODE',
    );
  });

  it('forwards regenerate requests', async () => {
    twoFactorMethodService.regenerateBackupCodes.mockResolvedValue({});
    await controller.regenerateBackupCodes({ userId: USER_ID });
    expect(twoFactorMethodService.regenerateBackupCodes).toHaveBeenCalledWith(
      USER_ID,
    );
  });
});
