import { ReauthController } from './reauth.controller';

describe('ReauthController wiring (AC-15)', () => {
  const reauthService = {
    verifyPassword: jest.fn(),
    isVerified: jest.fn(),
  };
  const controller = new ReauthController(reauthService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards verify requests to ReauthService.verifyPassword', async () => {
    reauthService.verifyPassword.mockResolvedValue(true);

    const result = await controller.verifyEvent({
      userId: '018f0000-0000-7000-8000-000000000001',
      password: 'correct-password',
    });

    expect(reauthService.verifyPassword).toHaveBeenCalledWith(
      '018f0000-0000-7000-8000-000000000001',
      'correct-password',
    );
    expect(result).toBe(true);
  });

  it('forwards check requests to ReauthService.isVerified', async () => {
    reauthService.isVerified.mockResolvedValue(false);

    const result = await controller.checkEvent({
      userId: '018f0000-0000-7000-8000-000000000001',
    });

    expect(reauthService.isVerified).toHaveBeenCalledWith(
      '018f0000-0000-7000-8000-000000000001',
    );
    expect(result).toBe(false);
  });
});
