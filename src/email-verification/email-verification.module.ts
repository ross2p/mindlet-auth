import { NotificationClientModule } from '../notification-client/notification-grpc-client.module';
import { Module } from '@nestjs/common';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationRepository } from './email-verification.repository';
import { CacheModule } from '../cache/cache.module';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';
import { UserClientModule } from '../user-client/user-client.module';

@Module({
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, EmailVerificationRepository],
  imports: [
    UserClientModule,
    NotificationClientModule,
    CacheModule.forFeature({
      prefix: 'auth:email-verify',
      defaultTtlSeconds: EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    }),
  ],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
