import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import type { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';

type ThrottlerStorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

/**
 * Redis-backed ThrottlerStorage (fixed window) for request-source rate limits.
 * Falls back to a process-local Map when REDIS_URL is unset (local/unit smoke).
 */
@Injectable()
export class RedisThrottlerStorage
  implements ThrottlerStorage, OnModuleDestroy
{
  private readonly logger = new Logger(RedisThrottlerStorage.name);
  private readonly redis: Redis | null;
  private readonly memory = new Map<
    string,
    { hits: number; expiresAt: number; blockExpiresAt: number }
  >();

  constructor(redisUrl: string) {
    if (!redisUrl) {
      this.logger.warn(
        'REDIS_URL not set — throttler storage uses in-memory fallback',
      );
      this.redis = null;
    } else {
      this.redis = new Redis(redisUrl, { maxRetriesPerRequest: 2 });
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis?.quit();
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const storageKey = `auth:throttle:${throttlerName}:${key}`;
    if (!this.redis) {
      return this.incrementMemory(storageKey, ttl, limit, blockDuration);
    }

    const hits = await this.redis.incr(storageKey);
    if (hits === 1) {
      await this.redis.pexpire(storageKey, ttl);
    }

    const pttl = await this.redis.pttl(storageKey);
    const timeToExpire =
      pttl > 0 ? Math.ceil(pttl / 1000) : Math.ceil(ttl / 1000);
    const isBlocked = hits > limit;
    let timeToBlockExpire = 0;

    if (isBlocked && blockDuration > 0) {
      const blockKey = `${storageKey}:block`;
      const blockTtl = await this.redis.pttl(blockKey);
      if (blockTtl <= 0) {
        await this.redis.set(blockKey, '1', 'PX', blockDuration);
        timeToBlockExpire = Math.ceil(blockDuration / 1000);
      } else {
        timeToBlockExpire = Math.ceil(blockTtl / 1000);
      }
    }

    return {
      totalHits: hits,
      timeToExpire,
      isBlocked,
      timeToBlockExpire,
    };
  }

  private incrementMemory(
    storageKey: string,
    ttl: number,
    limit: number,
    blockDuration: number,
  ): ThrottlerStorageRecord {
    const now = Date.now();
    let entry = this.memory.get(storageKey);
    if (!entry || entry.expiresAt <= now) {
      entry = {
        hits: 0,
        expiresAt: now + ttl,
        blockExpiresAt: 0,
      };
      this.memory.set(storageKey, entry);
    }

    entry.hits += 1;
    const isBlocked = entry.hits > limit;
    if (isBlocked && entry.blockExpiresAt <= now && blockDuration > 0) {
      entry.blockExpiresAt = now + blockDuration;
    }

    return {
      totalHits: entry.hits,
      timeToExpire: Math.ceil((entry.expiresAt - now) / 1000),
      isBlocked: isBlocked || entry.blockExpiresAt > now,
      timeToBlockExpire:
        entry.blockExpiresAt > now
          ? Math.ceil((entry.blockExpiresAt - now) / 1000)
          : 0,
    };
  }
}
