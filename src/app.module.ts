import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { GoogleModule } from './google/google.module';
import { SessionModule } from './session/session.module';
import { RouterModule } from '@nestjs/core';
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
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 200 }],
    }),
    AuthModule,
    CredentialsModule,
    GoogleModule,
    PasswordResetModule,
    EmailVerificationModule,
    TwoFactorModule,
    TwoFactorEnrollmentModule,
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
        children: [
          GoogleModule,
          CredentialsModule,
          SessionModule,
          PasswordResetModule,
          EmailVerificationModule,
          TwoFactorModule,
          TwoFactorEnrollmentModule,
        ],
      },
    ]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
