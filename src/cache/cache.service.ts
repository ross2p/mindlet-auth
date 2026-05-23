import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { ObjectSchema } from 'joi';

export interface CacheModuleOptions {
  redisUrl: string;
  prefix: string;
  defaultTtlSeconds?: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(this.constructor.name);
  private readonly redis: Redis | null;
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(options: CacheModuleOptions) {
    this.prefix = options.prefix;
    this.defaultTtl = options.defaultTtlSeconds ?? 3600;

    if (!options.redisUrl) {
      this.logger.warn('REDIS_URL not set — cache operations are no-ops');
      this.redis = null;
    } else {
      this.redis = new Redis(options.redisUrl, { maxRetriesPerRequest: 2 });
    }
  }

  async onModuleDestroy() {
    await this.redis?.quit();
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string, schema?: ObjectSchema<T>): Promise<T | null> {
    if (!this.redis) return null;
    const raw = await this.redis.get(this.getKey(key));
    if (raw == null) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }
    if (schema) {
      const validationResult = schema.validate(parsed, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });
      if (validationResult.error) {
        this.logger.warn(
          `cache key ${key}: validation failed, treating as miss (${validationResult.error.message})`,
        );
        return null;
      }
      return validationResult.value;
    }
    return parsed as T;
  }

  async getWithTtl<T>(
    k: string,
    schema?: ObjectSchema<T>,
  ): Promise<{ value: T | null; ttl: number }> {
    if (!this.redis) return { value: null, ttl: 0 };
    const row = await this.get<T>(k, schema);
    if (row == null) return { value: null, ttl: 0 };
    return { value: row, ttl: await this.redis.ttl(this.getKey(k)) };
  }

  async set<T>(k: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.redis) return;
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.redis.setex(this.getKey(k), ttl, JSON.stringify(value));
  }

  async delete(k: string): Promise<void> {
    if (!this.redis) return;
    await this.redis.del(this.getKey(k));
  }
}
