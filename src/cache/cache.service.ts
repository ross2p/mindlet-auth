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
  private readonly client: Redis;
  private readonly prefix: string;
  private readonly defaultTtl: number;

  constructor(options: CacheModuleOptions) {
    if (!options.redisUrl) {
      throw new Error('REDIS_URL is required');
    }
    this.prefix = options.prefix;
    this.defaultTtl = options.defaultTtlSeconds ?? 3600;
    this.client = new Redis(options.redisUrl, { maxRetriesPerRequest: 2 });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  async get<T>(key: string, schema?: ObjectSchema<T>): Promise<T | null> {
    const raw = await this.client.get(this.getKey(key));
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
    const row = await this.get<T>(k, schema);
    if (row == null) return { value: null, ttl: 0 };
    return { value: row, ttl: await this.client.ttl(this.getKey(k)) };
  }

  async set<T>(k: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.client.setex(this.getKey(k), ttl, JSON.stringify(value));
  }

  async delete(k: string): Promise<void> {
    await this.client.del(this.getKey(k));
  }
}
