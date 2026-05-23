import { Injectable } from '@nestjs/common';
import { EmailVerificationCodePayload } from './email-verification-code-payload.type';
import { CacheService } from '../cache/cache.service';

const CODE_PREFIX = 'code';

@Injectable()
export class EmailVerificationRepository {
  constructor(private readonly cache: CacheService) {}

  async findEmailVerificationCodeByUserId(
    userId: string,
  ): Promise<EmailVerificationCodePayload | null> {
    return this.cache.get<EmailVerificationCodePayload>(
      `${CODE_PREFIX}:${userId}`,
    );
  }

  async deleteEmailVerificationCode(userId: string): Promise<void> {
    await this.cache.delete(`${CODE_PREFIX}:${userId}`);
  }
}
