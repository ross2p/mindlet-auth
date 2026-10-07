import { ReauthService } from './reauth.service';

describe('ReauthService (AC-14/16/18/19/23)', () => {
  const cache = {
    set: jest.fn(),
    get: jest.fn(),
    delete: jest.fn(),
  };
  const userClient = {
    verifyPassword: jest.fn(),
  };

  let service: ReauthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ReauthService(cache as never, userClient as never);
  });

  it('sets a marker on correct credentials', async () => {
    userClient.verifyPassword.mockResolvedValue({ valid: true });

    const result = await service.verifyPassword(
      '018f0000-0000-7000-8000-000000000001',
      'correct-password',
    );

    expect(result).toBe(true);
    expect(cache.set).toHaveBeenCalledWith(
      '018f0000-0000-7000-8000-000000000001',
      true,
      600,
    );
  });

  it('does not set a marker on incorrect credentials', async () => {
    userClient.verifyPassword.mockResolvedValue({ valid: false });

    const result = await service.verifyPassword(
      '018f0000-0000-7000-8000-000000000001',
      'wrong-password',
    );

    expect(result).toBe(false);
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('a check within 10 minutes succeeds', async () => {
    cache.get.mockResolvedValue(true);

    const result = await service.isVerified(
      '018f0000-0000-7000-8000-000000000001',
    );

    expect(result).toBe(true);
  });

  it('an expired or absent marker fails the check', async () => {
    cache.get.mockResolvedValue(null);

    const result = await service.isVerified(
      '018f0000-0000-7000-8000-000000000001',
    );

    expect(result).toBe(false);
  });
});
