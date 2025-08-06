import { Module } from '@nestjs/common';
import { createClientConfig, Services } from '@ross2p/messages';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CredentialsModule } from './modules/credentials/credentials.module';

@Module({
  imports: [
    ClientsModule.registerAsync([
      createClientConfig(Services.USER),
      createClientConfig(Services.TOKEN),
    ]),
    CredentialsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
