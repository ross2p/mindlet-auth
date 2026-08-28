import { sha256Hex } from '../utils/sha256.util';
import { AuthService } from './auth.service';

describe('AuthService generateTokens (AC-18)', () => {
  const userTokenService = {
    generateTokens: jest.fn().mockReturnValue({
      accessToken: { token: 'access' },
      refreshToken: { token: 'refresh-plain' },
    }),
  };
  const userService = {
    sendAndReturnPromise: jest.fn().mockResolvedValue({
      id: 'u1',
      email: 'user-a1b2@example.test',
      emailVerifiedAt: new Date(),
      twoFactorEnabled: false,
    }),
  };
  const sessionService = {
    findActiveSessionByIdOrThrow: jest.fn().mockResolvedValue({
      id: 's1',
      userId: 'u1',
      twoFactorVerifiedAt: new Date(),
    }),
    persistRefreshTokenHash: jest.fn(),
    verifyRefreshTokenHash: jest.fn(),
    updateLastUsedAt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userTokenService.generateTokens.mockReturnValue({
      accessToken: { token: 'access' },
      refreshToken: { token: 'refresh-plain' },
    });
    userService.sendAndReturnPromise.mockResolvedValue({
      id: 'u1',
      email: 'user-a1b2@example.test',
      emailVerifiedAt: new Date(),
      twoFactorEnabled: false,
    });
    sessionService.findActiveSessionByIdOrThrow.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      twoFactorVerifiedAt: new Date(),
    });
  });

  it('persists sha256(refreshToken) on the Session after mint (AC-18)', async () => {
    const service = new AuthService(
      userTokenService as never,
      userService as never,
      sessionService as never,
    );

    await service.generateTokens({ sessionId: 's1' });

    expect(sessionService.persistRefreshTokenHash).toHaveBeenCalledWith(
      's1',
      'refresh-plain',
    );
    expect(sha256Hex('refresh-plain')).toHaveLength(64);
  });

  it('skips hash persist when minting access-only after verify', async () => {
    const service = new AuthService(
      userTokenService as never,
      userService as never,
      sessionService as never,
    );

    await service.generateTokens({ sessionId: 's1', persistRefresh: false });

    expect(sessionService.persistRefreshTokenHash).not.toHaveBeenCalled();
  });
});
