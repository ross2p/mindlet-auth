import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { Client, Transport } from '@nestjs/microservices';
import { ClientModule, Services } from '@ross2p/messages';

@Module({
  controllers: [CredentialsController],
  providers: [CredentialsService],
  imports: [ClientModule.register(Services.USER)],
})
export class CredentialsModule {}
