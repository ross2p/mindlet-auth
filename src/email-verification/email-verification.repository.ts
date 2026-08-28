import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CacheService } from '../cache/cache.service';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';
import { EmailVerificationEntity } from './email-verification.entity';
import { emailVerificationEntitySchema } from './schemas/email-verification-entity.schema';

const CODE_PREFIX = 'code';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly cache: CacheService) {}

  private getKey(userId: string): string {
    return `${CODE_PREFIX}:${userId}`;
  }

  async findEmailVerificationCodeByUserId(
    userId: string,
  ): Promise<EmailVerificationEntity | null> {
    return this.cache.get<EmailVerificationEntity>(
      this.getKey(userId),
      emailVerificationEntitySchema,
    );
  }

  async createEmailVerificationCode(args: {
    userId: string;
    code: string;
  }): Promise<EmailVerificationEntity> {
    const now = new Date();
    const entity: EmailVerificationEntity = {
      id: randomUUID(),
      userId: args.userId,
      code: args.code,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    await this.cache.set(
      this.getKey(args.userId),
      entity,
      EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    );
    return entity;
  }

  async deleteEmailVerificationCode(userId: string): Promise<void> {
    await this.cache.delete(this.getKey(userId));
  }
}
