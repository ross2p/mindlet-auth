import { Module } from '@nestjs/common';
import { RpcController } from './rpc.controller';
import { CredentialsModule } from '../credentials/credentials.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { TwoFactorEnrollmentModule } from '../two-factor-enrollment/two-factor-enrollment.module';
import { TwoFactorMethodModule } from '../two-factor-method/two-factor-method.module';
import { ReauthModule } from '../reauth/reauth.module';
import { PasswordResetModule } from '../password-reset/password-reset.module';
import { TwoFactorModule } from '../two-factor/two-factor.module';

@Module({
  // AuthService and SessionService come from @Global() AuthModule/SessionModule.
  imports: [
    CredentialsModule,
    EmailVerificationModule,
    TwoFactorEnrollmentModule,
    TwoFactorMethodModule,
    ReauthModule,
    PasswordResetModule,
    TwoFactorModule,
  ],
  controllers: [RpcController],
})
export class RpcModule {}
