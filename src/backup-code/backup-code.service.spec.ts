import * as argon2 from 'argon2';
import { BackupCodeService } from './backup-code.service';

describe('BackupCodeService (AC-31/32)', () => {
  const repository = {
    findUnusedByUserId: jest.fn(),
    markUsed: jest.fn(),
    replaceAllForUser: jest.fn(),
  };
  let service: BackupCodeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BackupCodeService(repository as never);
  });

  it('stores hashes of a fresh set and returns the plain codes', async () => {
    const codes = await service.issueCodes('u1');

    expect(codes).toHaveLength(10);
    const [userId, hashes] = repository.replaceAllForUser.mock.calls[0] as [
      string,
      string[],
    ];
    expect(userId).toBe('u1');
    expect(hashes).toHaveLength(10);
    expect(await argon2.verify(hashes[0], codes[0])).toBe(true);
  });

  it('consumes a matching unused code exactly once', async () => {
    repository.findUnusedByUserId.mockResolvedValue([
      { id: 'c1', codeHash: await argon2.hash('ABC123') },
    ]);

    await expect(service.consume('u1', ' ABC123 ')).resolves.toBe(true);
    expect(repository.markUsed).toHaveBeenCalledWith('c1');
  });

  it('returns false when no unused code matches', async () => {
    repository.findUnusedByUserId.mockResolvedValue([
      { id: 'c1', codeHash: await argon2.hash('ABC123') },
    ]);

    await expect(service.consume('u1', 'WRONG')).resolves.toBe(false);
    expect(repository.markUsed).not.toHaveBeenCalled();
  });
});
