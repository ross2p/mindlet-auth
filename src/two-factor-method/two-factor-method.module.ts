import { NotificationClientModule } from '../notification-client/notification-grpc-client.module';
import { Module } from '@nestjs/common';
import { EventClientModule, Services } from '@ross2p/common';
import { TwoFactorEnrollmentModule } from '../two-factor-enrollment/two-factor-enrollment.module';
import { BackupCodeModule } from '../backup-code/backup-code.module';
import { ReauthModule } from '../reauth/reauth.module';
import { TwoFactorMethodRepository } from './two-factor-method.repository';
import { TwoFactorMethodService } from './two-factor-method.service';
import { TwoFactorMethodMessageController } from './two-factor-method-message.controller';

@Module({
  imports: [
    TwoFactorEnrollmentModule,
    BackupCodeModule,
    ReauthModule,
    EventClientModule.register(Services.USER),
    NotificationClientModule,
  ],
  controllers: [TwoFactorMethodMessageController],
  providers: [TwoFactorMethodRepository, TwoFactorMethodService],
  exports: [TwoFactorMethodRepository, TwoFactorMethodService],
})
export class TwoFactorMethodModule {}
