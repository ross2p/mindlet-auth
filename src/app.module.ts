import { Module } from '@nestjs/common';
import { DatabaseModule } from '@ross2p/database';
import { AuthModule } from './auth/auth.module';
import { CredentialsModule } from './credentials/credentials.module';
import { GoogleModule } from './google/google.module';
import { UserValidatorModule } from './user-validator/user-validator.module';
import { SessionModule } from './session/session.module';
import { RouterModule } from '@nestjs/core';

@Module({
  imports: [
    // <----CONFIGS---->
    DatabaseModule,

    // <----MODULES---->
    AuthModule,
    CredentialsModule,
    GoogleModule,
    UserValidatorModule,
    SessionModule,

    // <----ROUTERS---->
    RouterModule.register([
      {
        path: 'auth',
        module: AuthModule,
        children: [GoogleModule, CredentialsModule, SessionModule],
      },
    ]),
  ],
})
export class AppModule {}
