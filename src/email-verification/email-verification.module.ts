import { Module } from '@nestjs/common';
import { EmailVerificationMessageController } from './email-verification-message.controller';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationRepository } from './email-verification.repository';
import { ClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';

@Module({
  controllers: [EmailVerificationMessageController],
  providers: [EmailVerificationService, EmailVerificationRepository],
  imports: [
    ClientModule.register(Services.USER, Services.NOTIFICATION),
    CacheModule.forFeature({
      prefix: 'auth:email-verify',
      defaultTtlSeconds: EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    }),
  ],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
