import { Module } from '@nestjs/common';
import { EmailVerificationController } from './email-verification.controller';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationRepository } from './email-verification.repository';
import { EventClientModule, Services } from '@ross2p/common';
import { CacheModule } from '../cache/cache.module';
import { EMAIL_VERIFICATION_CODE_TTL_SECONDS } from './email-verification.constants';
import { UserGrpcClientModule } from '../user-grpc/user-grpc-client.module';

@Module({
  controllers: [EmailVerificationController],
  providers: [EmailVerificationService, EmailVerificationRepository],
  imports: [
    UserGrpcClientModule,
    EventClientModule.register(Services.NOTIFICATION),
    CacheModule.forFeature({
      prefix: 'auth:email-verify',
      defaultTtlSeconds: EMAIL_VERIFICATION_CODE_TTL_SECONDS,
    }),
  ],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
