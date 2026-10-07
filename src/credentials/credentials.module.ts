import { Module } from '@nestjs/common';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';
import { TwoFactorModule } from '../two-factor/two-factor.module';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { UserGrpcClientModule } from '../user-grpc/user-grpc-client.module';

@Module({
  controllers: [CredentialsController],
  imports: [UserGrpcClientModule, TwoFactorModule, EmailVerificationModule],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
