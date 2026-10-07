import { SessionController } from './session.controller';

describe('SessionController (AC-23)', () => {
  const sessionService = { signOutAll: jest.fn() };
  const controller = new SessionController(sessionService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('revokes every session for the deleted account on user.deleted', async () => {
    await controller.onUserDeleted({ userId: 'u1' });

    expect(sessionService.signOutAll).toHaveBeenCalledWith(
      'u1',
      'account-deleted',
    );
  });
});
