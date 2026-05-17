import { Injectable } from '@nestjs/common';
import { CacheService } from '../../cache/cache.service';

export interface PasswordResetTokenRecord {
  email: string;
}

@Injectable()
export class PasswordResetTokenRepository {
  constructor(private readonly cache: CacheService) {}

  async save(
    token: string,
    record: PasswordResetTokenRecord,
    ttlSeconds: number,
  ): Promise<void> {
    await this.cache.set(token, record, ttlSeconds);
  }

  async find(token: string): Promise<PasswordResetTokenRecord | null> {
    return this.cache.get<PasswordResetTokenRecord>(token);
  }

  async delete(token: string): Promise<void> {
    await this.cache.delete(token);
  }
}
