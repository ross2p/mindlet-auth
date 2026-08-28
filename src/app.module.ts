import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { GoogleModule } from './google/google.module';
import { SessionModule } from './session/session.module';
import { DatabaseModule } from './database/database.module';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { TwoFactorModule } from './two-factor/two-factor.module';
import { TwoFactorEnrollmentModule } from './two-factor-enrollment/two-factor-enrollment.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    DatabaseModule,
    SessionModule,
    TokenModule,
    AuthModule,
    CredentialsModule,
    GoogleModule,
    PasswordResetModule,
    EmailVerificationModule,
    TwoFactorModule,
    TwoFactorEnrollmentModule,
  ],
})
export class AppModule {}
