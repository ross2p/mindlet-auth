import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  CommonModule,
  ErrorFilter,
  ExceptionFilter,
  GlobalFilter,
  globalPipe,
  RpcExpiryInterceptor,
} from '@ross2p/common';
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
    CommonModule,
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
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RpcExpiryInterceptor,
    },
    {
      provide: APP_PIPE,
      useValue: globalPipe,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule {}
