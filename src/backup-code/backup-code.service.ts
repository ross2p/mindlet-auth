import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { BackupCodeRepository } from './backup-code.repository';

const BACKUP_CODE_COUNT = 10;

@Injectable()
export class BackupCodeService {
  constructor(private readonly backupCodeRepository: BackupCodeRepository) {}

  /**
   * Invalidates the previous set, stores hashes of a fresh one and returns the
   * plain codes — the only time they are ever visible (AC-31).
   */
  public async issueCodes(userId: string): Promise<string[]> {
    const codes = Array.from({ length: BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
    const hashes = await Promise.all(codes.map((plain) => argon2.hash(plain)));
    await this.backupCodeRepository.replaceAllForUser(userId, hashes);
    return codes;
  }

  /** Marks the matching unused code used (single-use, AC-32); `false` if none matches. */
  public async consume(userId: string, code: string): Promise<boolean> {
    const unused = await this.backupCodeRepository.findUnusedByUserId(userId);
    for (const candidate of unused) {
      if (await argon2.verify(candidate.codeHash, code.trim())) {
        await this.backupCodeRepository.markUsed(candidate.id);
        return true;
      }
    }
    return false;
  }
}
