import { NotificationClientModule } from '../notification-client/notification-grpc-client.module';
import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { UserClientModule } from '../user-client/user-client.module';

@Module({
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  imports: [UserClientModule, NotificationClientModule, TwoFactorModule],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
