import { Module } from '@nestjs/common';
import { UserValidatorController } from './user-validator.controller';
import { UserValidatorService } from './user-validator.service';
import { ClientModule, Services } from '@ross2p/common';

@Module({
  controllers: [UserValidatorController],
  providers: [UserValidatorService],
  imports: [ClientModule.register(Services.USER)],
  exports: [UserValidatorService],
})
export class UserValidatorModule {}
