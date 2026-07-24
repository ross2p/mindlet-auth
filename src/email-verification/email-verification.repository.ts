import { Injectable } from '@nestjs/common';
import { EmailVerificationCodePayload } from './email-verification-code-payload.type';
import { CacheService } from '../cache/cache.service';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';

const CODE_PREFIX = 'code';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly cache: CacheService) {}

  private getKey(userId: string): string {
    return `${CODE_PREFIX}:${userId}`;
  }

  async findEmailVerificationCodeByUserId(
    userId: string,
  ): Promise<EmailVerificationCodePayload | null> {
    return this.cache.get<EmailVerificationCodePayload>(this.getKey(userId));
  }

  async createEmailVerificationCode(
    userId: string,
    code: string,
  ): Promise<EmailVerificationCodePayload> {
    const now = new Date();
    const payload: EmailVerificationCodePayload = {
      code,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    await this.cache.set(
      this.getKey(userId),
      payload,
      EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    );
    return payload;
  }

  async deleteEmailVerificationCode(userId: string): Promise<void> {
    await this.cache.delete(this.getKey(userId));
  }
}
