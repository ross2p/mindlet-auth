import { AccountDeletionSyncController } from './account-deletion-sync.controller';

describe('AccountDeletionSyncController (AC-23)', () => {
  const sessionService = { signOutAll: jest.fn() };
  const controller = new AccountDeletionSyncController(sessionService as never);

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
