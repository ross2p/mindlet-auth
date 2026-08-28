import { Module } from '@nestjs/common';
import { PasswordResetMessageController } from './password-reset-message.controller';
import { PasswordResetService } from './password-reset.service';
import { ClientModule, Services } from '@ross2p/common';
import { TwoFactorModule } from '../two-factor/two-factor.module';

@Module({
  controllers: [PasswordResetMessageController],
  providers: [PasswordResetService],
  imports: [
    ClientModule.register(Services.USER, Services.NOTIFICATION),
    TwoFactorModule,
  ],
})
export class PasswordResetModule {}
