import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { ClientModule, Services } from '@ross2p/common';
import { CredentialsService } from './credentials.service';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { CredentialsMessageController } from './credentials-message.controller';

@Module({
  controllers: [CredentialsController, CredentialsMessageController],
  imports: [
    ClientModule.register(Services.USER),
    TwoFactorModule,
    EmailVerificationModule,
  ],
  providers: [CredentialsService],
})
export class CredentialsModule {}
