import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { TWO_FACTOR_ENROLLMENT_TTL_SECONDS } from './two-factor-enrollment.constants';
import { TwoFactorEnrollmentEntity } from './two-factor-enrollment.entity';
import { twoFactorEnrollmentEntitySchema } from './schemas/two-factor-enrollment-entity.schema';

const KEY_PREFIX = 'enroll';

@Injectable()
export class TwoFactorEnrollmentRepository {
  constructor(private readonly cache: CacheService) {}

  private getKey(userId: string): string {
    return `${KEY_PREFIX}:${userId}`;
  }

  async createEnrollmentChallenge(
    userId: string,
    code: string,
  ): Promise<TwoFactorEnrollmentEntity | null> {
    const now = new Date();
    await this.cache.set<TwoFactorEnrollmentEntity>(
      this.getKey(userId),
      {
        userId,
        code,
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      },
      TWO_FACTOR_ENROLLMENT_TTL_SECONDS,
    );
    return this.findByUserId(userId);
  }

  async findByUserId(
    userId: string,
  ): Promise<TwoFactorEnrollmentEntity | null> {
    return this.cache.get<TwoFactorEnrollmentEntity>(
      this.getKey(userId),
      twoFactorEnrollmentEntitySchema,
    );
  }

  async updateEnrollmentChallenge(
    input: Pick<TwoFactorEnrollmentEntity, 'userId' | 'attempts'>,
  ): Promise<TwoFactorEnrollmentEntity | null> {
    const key = this.getKey(input.userId);
    const { value: existing, ttl } =
      await this.cache.getWithTtl<TwoFactorEnrollmentEntity>(
        key,
        twoFactorEnrollmentEntitySchema,
      );
    if (!existing) return null;
    const updated: TwoFactorEnrollmentEntity = {
      ...existing,
      attempts: input.attempts,
      updatedAt: new Date(),
    };
    await this.cache.set(key, updated, ttl);
    return updated;
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.cache.delete(this.getKey(userId));
  }
}
