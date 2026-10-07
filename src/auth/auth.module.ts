import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Services, EventClientModule } from '@ross2p/common';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [EventClientModule.register(Services.USER)],
  exports: [AuthService],
})
export class AuthModule {}
