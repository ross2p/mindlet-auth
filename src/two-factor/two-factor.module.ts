import { Module } from '@nestjs/common';
import { TwoFactorController } from './two-factor.controller';
import { TwoFactorMessageController } from './two-factor-message.controller';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorRepository } from './two-factor.repository';
import { ClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { TWO_FACTOR_CHALLENGE_TTL_SECONDS } from './two-factor.constants';

@Module({
  controllers: [TwoFactorController, TwoFactorMessageController],
  providers: [TwoFactorService, TwoFactorRepository],
  imports: [
    ClientModule.register(Services.USER, Services.NOTIFICATION),
    CacheModule.forFeature({
      prefix: 'auth:2fa',
      defaultTtlSeconds: TWO_FACTOR_CHALLENGE_TTL_SECONDS,
    }),
  ],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}
