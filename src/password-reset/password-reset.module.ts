import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { EventClientModule, Services } from '@ross2p/common';
import { TwoFactorModule } from '../two-factor/two-factor.module';

@Module({
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  imports: [
    EventClientModule.register(Services.USER, Services.NOTIFICATION),
    TwoFactorModule,
  ],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
