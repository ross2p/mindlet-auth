import { Global, Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { SessionRepository } from './session.repository';
import { ClientModule, Services } from '@ross2p/common';

@Global()
@Module({
  imports: [ClientModule.register(Services.USER)],
  controllers: [SessionController],
  providers: [SessionService, SessionRepository],
  exports: [SessionService],
})
export class SessionModule {}
