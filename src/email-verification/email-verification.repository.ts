import { Injectable } from '@nestjs/common';
import { EmailVerificationCodePayload } from './email-verification-code-payload.type';
import { CacheService } from '../cache/cache.service';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';

const CODE_PREFIX = 'code';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly cache: CacheService) {}

  async createEmailVerificationCode(
    userId: string,
    payload: EmailVerificationCodePayload,
    ttlSeconds = EMAIL_VERIFICATION_CODE_TTL_SECONDS,
  ): Promise<void> {
    await this.cache.set<EmailVerificationCodePayload>(
      `${CODE_PREFIX}:${userId}`,
      payload,
      ttlSeconds,
    );
  }

  async findEmailVerificationCodeByUserId(
    userId: string,
  ): Promise<EmailVerificationCodePayload | null> {
    return this.cache.get<EmailVerificationCodePayload>(
      `${CODE_PREFIX}:${userId}`,
    );
  }

  async updateEmailVerificationCodeAttempts(
    userId: string,
    attempts: number,
    ttlSeconds = EMAIL_VERIFICATION_CODE_TTL_SECONDS,
  ): Promise<void> {
    const key = `${CODE_PREFIX}:${userId}`;
    const payload = await this.cache.get<EmailVerificationCodePayload>(key);
    if (!payload) return;
    await this.cache.set(key, { ...payload, attempts }, ttlSeconds);
  }

  async deleteEmailVerificationCode(userId: string): Promise<void> {
    await this.cache.delete(`${CODE_PREFIX}:${userId}`);
  }
}
