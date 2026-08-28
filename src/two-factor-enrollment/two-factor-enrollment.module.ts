import { Module } from '@nestjs/common';
import { TwoFactorEnrollmentMessageController } from './two-factor-enrollment-message.controller';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';
import { TwoFactorEnrollmentRepository } from './two-factor-enrollment.repository';
import { ClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { TWO_FACTOR_ENROLLMENT_TTL_SECONDS } from './two-factor-enrollment.constants';

@Module({
  controllers: [TwoFactorEnrollmentMessageController],
  providers: [TwoFactorEnrollmentService, TwoFactorEnrollmentRepository],
  imports: [
    ClientModule.register(Services.USER, Services.NOTIFICATION),
    CacheModule.forFeature({
      prefix: 'auth:2fa-enroll',
      defaultTtlSeconds: TWO_FACTOR_ENROLLMENT_TTL_SECONDS,
    }),
  ],
  exports: [TwoFactorEnrollmentService],
})
export class TwoFactorEnrollmentModule {}
