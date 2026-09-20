import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { BackupCodeEntity } from './backup-code.entity';

@Injectable()
export class BackupCodeRepository {
  constructor(private readonly db: DatabaseService) {}

  public findUnusedByUserId(userId: string): Promise<BackupCodeEntity[]> {
    return this.db.backupCode.findMany({
      where: { userId, usedAt: null },
    });
  }

  /** Marks a code used so it can never be consumed again (AC-32). */
  public markUsed(id: string): Promise<BackupCodeEntity> {
    return this.db.backupCode.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  /** Invalidates the previous set and stores a fresh one (AC-31). */
  public async replaceAllForUser(
    userId: string,
    codeHashes: string[],
  ): Promise<void> {
    await this.db.backupCode.deleteMany({ where: { userId } });
    await this.db.backupCode.createMany({
      data: codeHashes.map((codeHash) => ({ userId, codeHash })),
    });
  }
}
