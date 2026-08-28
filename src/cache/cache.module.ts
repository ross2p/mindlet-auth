import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService, CacheModuleOptions } from './cache.service';

export interface CacheFeatureOptions {
  prefix: string;
  defaultTtlSeconds?: number;
}

@Module({})
export class CacheModule {
  static forFeature(opts: CacheFeatureOptions): DynamicModule {
    return {
      module: CacheModule,
      providers: [
        {
          provide: CacheService,
          useFactory: (config: ConfigService): CacheService => {
            const options: CacheModuleOptions = {
              redisUrl: config.getOrThrow<string>('REDIS_URL'),
              prefix: opts.prefix,
              defaultTtlSeconds: opts.defaultTtlSeconds,
            };
            return new CacheService(options);
          },
          inject: [ConfigService],
        },
      ],
      exports: [CacheService],
    };
  }
}
