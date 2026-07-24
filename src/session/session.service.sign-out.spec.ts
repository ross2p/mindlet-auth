import { ForbiddenException } from '@nestjs/common';
import { SessionService } from './session.service';

describe('SessionService sign-out (AC-16)', () => {
  const sessionRepository = {
    findSessionById: jest.fn(),
    updateSession: jest.fn(),
    bulkUpdateSessionsByUserId: jest.fn(),
  };
  const userEventClient = {
    emitEvent: jest.fn(),
  };

  let service: SessionService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SessionService(
      sessionRepository as never,
      userEventClient as never,
    );
  });

  it('revokes only the current session', async () => {
    sessionRepository.findSessionById.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      revokedAt: null,
    });
    sessionRepository.updateSession.mockResolvedValue({
      id: 's1',
      userId: 'u1',
      revokedAt: new Date(),
      revokedReason: 'sign-out',
    });

    await service.signOut('u1', 's1', 'sign-out');

    expect(sessionRepository.updateSession).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({
        revokedReason: 'sign-out',
      }),
    );
    expect(sessionRepository.bulkUpdateSessionsByUserId).not.toHaveBeenCalled();
  });

  it('rejects sign-out for a session owned by another user', async () => {
    sessionRepository.findSessionById.mockResolvedValue({
      id: 's1',
      userId: 'other',
      revokedAt: null,
    });

    await expect(
      service.signOut('u1', 's1', 'sign-out'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
