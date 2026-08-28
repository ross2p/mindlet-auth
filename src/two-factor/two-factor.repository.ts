import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { TWO_FACTOR_CHALLENGE_TTL_SECONDS } from './two-factor.constants';
import {
  TWO_FACTOR_ATTEMPT_TTL_SECONDS,
  twoFactorUserFailKey,
} from '../auth-challenge.constants';
import { CreateTwoFactorCodeDto } from './dtos/create-two-factor-code.dto';
import { UpdateTwoFactorCodeDto } from './dtos/update-two-factor-code.dto';
import { TwoFactorEntity } from './two-factor.entity';
import { twoFactorEntitySchema } from './schemas/two-factor-entity.schema';

const CODE_PREFIX = 'code';

@Injectable()
export class TwoFactorRepository {
  constructor(private readonly cache: CacheService) {}

  private getKey(sessionId: string): string {
    return `${CODE_PREFIX}:${sessionId}`;
  }

  async createTwoFactorCode(
    input: CreateTwoFactorCodeDto,
  ): Promise<TwoFactorEntity | null> {
    const now = new Date();
    await this.cache.set<TwoFactorEntity>(
      this.getKey(input.sessionId),
      {
        sessionId: input.sessionId,
        code: input.code,
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      },
      TWO_FACTOR_CHALLENGE_TTL_SECONDS,
    );
    return this.findTwoFactorCodeBySessionId(input.sessionId);
  }

  async findTwoFactorCodeBySessionId(
    sessionId: string,
  ): Promise<TwoFactorEntity | null> {
    const twoFactorCode = await this.cache.get<TwoFactorEntity>(
      this.getKey(sessionId),
      twoFactorEntitySchema,
    );
    return twoFactorCode;
  }

  async updateTwoFactorCode(
    input: UpdateTwoFactorCodeDto,
  ): Promise<TwoFactorEntity | null> {
    const key = this.getKey(input.sessionId);
    const { value: existingTwoFactorCode, ttl } =
      await this.cache.getWithTtl<TwoFactorEntity>(key, twoFactorEntitySchema);
    if (!existingTwoFactorCode) return null;
    const updateTwoFactorCode = {
      ...existingTwoFactorCode,
      ...input,
      updatedAt: new Date(),
    };
    await this.cache.set(key, updateTwoFactorCode, ttl);
    return updateTwoFactorCode;
  }

  async deleteTwoFactorCode(sessionId: string): Promise<void> {
    await this.cache.delete(this.getKey(sessionId));
  }

  async getUserFailedAttempts(userId: string): Promise<number> {
    const raw = await this.cache.get<number>(twoFactorUserFailKey(userId));
    return typeof raw === 'number' ? raw : 0;
  }

  async incrementUserFailedAttempts(userId: string): Promise<number> {
    const key = twoFactorUserFailKey(userId);
    const { value, ttl } = await this.cache.getWithTtl<number>(key);
    const next = (typeof value === 'number' ? value : 0) + 1;
    const remaining = ttl > 0 ? ttl : TWO_FACTOR_ATTEMPT_TTL_SECONDS;
    await this.cache.set(key, next, remaining);
    return next;
  }
}
