import { Injectable } from '@nestjs/common';
import type { SecondFactorMethodType } from '.prisma/client-auth';
import { DatabaseService } from '../database/database.service';
import { TwoFactorMethodEntity } from './two-factor-method.entity';

@Injectable()
export class TwoFactorMethodRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Enforces one row per (userId, type) via upsert on that unique key
   * (AC-30): enabling/disabling the same method toggles the same row.
   */
  public setEnabled(
    userId: string,
    type: SecondFactorMethodType,
    enabled: boolean,
  ): Promise<TwoFactorMethodEntity> {
    return this.db.secondFactorMethod.upsert({
      where: { userId_type: { userId, type } },
      create: { userId, type, enabled },
      update: { enabled },
    });
  }

  public findActiveByUserId(userId: string): Promise<TwoFactorMethodEntity[]> {
    return this.db.secondFactorMethod.findMany({
      where: { userId, enabled: true },
    });
  }

  public findByUserAndType(
    userId: string,
    type: SecondFactorMethodType,
  ): Promise<TwoFactorMethodEntity | null> {
    return this.db.secondFactorMethod.findUnique({
      where: { userId_type: { userId, type } },
    });
  }
}
