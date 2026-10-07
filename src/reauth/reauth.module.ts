import { Module } from '@nestjs/common';
import { EventClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { ReauthService } from './reauth.service';
import { ReauthController } from './reauth.controller';
import { REAUTH_TTL_SECONDS } from './reauth.constants';

@Module({
  imports: [
    EventClientModule.register(Services.USER),
    CacheModule.forFeature({
      prefix: 'auth:reauth',
      defaultTtlSeconds: REAUTH_TTL_SECONDS,
    }),
  ],
  controllers: [ReauthController],
  providers: [ReauthService],
  exports: [ReauthService],
})
export class ReauthModule {}
