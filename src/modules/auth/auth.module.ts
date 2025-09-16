import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Services } from '@ross2p/common';
import { ClientModule } from '@ross2p/common';
import { SessionModule } from '../session/session.module';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    SessionModule,
    ClientModule.register(Services.TOKEN, Services.USER),
  ],
  exports: [AuthService],
})
export class AuthModule {}
