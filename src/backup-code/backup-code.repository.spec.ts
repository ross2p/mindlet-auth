import { BackupCodeRepository } from './backup-code.repository';

describe('BackupCodeRepository (AC-32)', () => {
  const db = {
    backupCode: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  };
  let repository: BackupCodeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new BackupCodeRepository(db as never);
  });

  it('only returns unused codes', async () => {
    db.backupCode.findMany.mockResolvedValue([
      { id: 'c1', userId: 'u1', codeHash: 'hash1', usedAt: null },
    ]);

    const result = await repository.findUnusedByUserId('u1');

    expect(db.backupCode.findMany).toHaveBeenCalledWith({
      where: { userId: 'u1', usedAt: null },
    });
    expect(result).toHaveLength(1);
  });

  it('marks a code used so it cannot be consumed again', async () => {
    db.backupCode.update.mockResolvedValue({
      id: 'c1',
      userId: 'u1',
      codeHash: 'hash1',
      usedAt: new Date(),
    });

    const result = await repository.markUsed('c1');

    const calls = db.backupCode.update.mock.calls as unknown as [
      { where: { id: string }; data: { usedAt: Date } },
    ][];
    const call = calls[0][0];
    expect(call.where).toEqual({ id: 'c1' });
    expect(call.data.usedAt).toBeInstanceOf(Date);
    expect(result.usedAt).not.toBeNull();
  });

  it('replaces the whole set on regenerate (AC-31)', async () => {
    await repository.replaceAllForUser('u1', ['hashA', 'hashB']);

    expect(db.backupCode.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
    });
    expect(db.backupCode.createMany).toHaveBeenCalledWith({
      data: [
        { userId: 'u1', codeHash: 'hashA' },
        { userId: 'u1', codeHash: 'hashB' },
      ],
    });
  });
});
