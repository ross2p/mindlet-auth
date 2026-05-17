import { Module } from '@nestjs/common';
import { PasswordResetController } from './password-reset.controller';
import { PasswordResetService } from './password-reset.service';
import { ClientModule, Services } from '@ross2p/common';

@Module({
  controllers: [PasswordResetController],
  providers: [PasswordResetService],
  imports: [ClientModule.register(Services.USER)],
})
export class PasswordResetModule {}
