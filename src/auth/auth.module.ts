import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserClientModule } from '../user-client/user-client.module';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserClientModule],
  exports: [AuthService],
})
export class AuthModule {}
