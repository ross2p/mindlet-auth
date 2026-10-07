import { NotificationClientModule } from '../notification-client/notification-grpc-client.module';
import { Module } from '@nestjs/common';
import { TwoFactorEnrollmentController } from './two-factor-enrollment.controller';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';
import { TwoFactorEnrollmentRepository } from './two-factor-enrollment.repository';
import { CacheModule } from '../cache/cache.module';
import { TWO_FACTOR_ENROLLMENT_TTL_SECONDS } from './two-factor-enrollment.constants';
import { UserClientModule } from '../user-client/user-client.module';

@Module({
  controllers: [TwoFactorEnrollmentController],
  providers: [TwoFactorEnrollmentService, TwoFactorEnrollmentRepository],
  imports: [
    UserClientModule,
    NotificationClientModule,
    CacheModule.forFeature({
      prefix: 'auth:2fa-enroll',
      defaultTtlSeconds: TWO_FACTOR_ENROLLMENT_TTL_SECONDS,
    }),
  ],
  exports: [TwoFactorEnrollmentService],
})
export class TwoFactorEnrollmentModule {}
