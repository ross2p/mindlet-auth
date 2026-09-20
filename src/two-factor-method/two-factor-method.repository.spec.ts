import { TwoFactorMethodRepository } from './two-factor-method.repository';

describe('TwoFactorMethodRepository', () => {
  const db = {
    secondFactorMethod: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  let repository: TwoFactorMethodRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new TwoFactorMethodRepository(db as never);
  });

  it('enforces one active row per (userId, type) via upsert on the unique key', async () => {
    await repository.setEnabled('u1', 'EMAIL_CODE', true);

    expect(db.secondFactorMethod.upsert).toHaveBeenCalledWith({
      where: { userId_type: { userId: 'u1', type: 'EMAIL_CODE' } },
      create: { userId: 'u1', type: 'EMAIL_CODE', enabled: true },
      update: { enabled: true },
    });
  });

  it('finds active methods for a user', async () => {
    db.secondFactorMethod.findMany.mockResolvedValue([
      { id: 'm1', userId: 'u1', type: 'EMAIL_CODE', enabled: true },
    ]);

    const result = await repository.findActiveByUserId('u1');

    expect(db.secondFactorMethod.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1', enabled: true },
    });
    expect(result).toHaveLength(1);
  });
});
