import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { ClientModule, Services } from '@ross2p/common';
import { CredentialsService } from './credentials.service';

@Module({
  controllers: [CredentialsController],
  imports: [ClientModule.register(Services.USER)],
  providers: [CredentialsService],
})
export class CredentialsModule {}
