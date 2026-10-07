import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserGrpcClientModule } from '../user-grpc/user-grpc-client.module';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserGrpcClientModule],
  exports: [AuthService],
})
export class AuthModule {}
