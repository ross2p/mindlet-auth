import { Module } from '@nestjs/common';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorRepository } from './two-factor.repository';
import { EventClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { TWO_FACTOR_CHALLENGE_TTL_SECONDS } from './two-factor.constants';
import { UserClientModule } from '../user-client/user-client.module';

@Module({
  controllers: [TwoFactorController],
  providers: [TwoFactorService, TwoFactorRepository],
  imports: [
    UserClientModule,
    EventClientModule.register(Services.NOTIFICATION),
    CacheModule.forFeature({
      prefix: 'auth:2fa',
      defaultTtlSeconds: TWO_FACTOR_CHALLENGE_TTL_SECONDS,
    }),
  ],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
