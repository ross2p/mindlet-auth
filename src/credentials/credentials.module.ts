import { Module } from '@nestjs/common';
import { ClientModule, Services } from '@ross2p/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';

@Module({
  controllers: [CredentialsController],
  imports: [
    ClientModule.register(Services.USER),
    TwoFactorModule,
    EmailVerificationModule,
  ],
  providers: [CredentialsService],
})
export class CredentialsModule {}
