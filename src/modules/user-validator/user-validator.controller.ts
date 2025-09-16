import { Controller, ValidationPipe } from '@nestjs/common';
import { UserValidatorService } from './user-validator.service';
import { AccessTokenDto } from '@ross2p/types';
import { MessagePattern } from '@nestjs/microservices';
import { AuthCommand, DataPayload } from '@ross2p/common';

@Controller()
export class UserValidatorController {
  constructor(private readonly userValidatorService: UserValidatorService) {}

  @MessagePattern(AuthCommand.USER_VALIDATE)
  async validateUserByToken(@DataPayload() data: AccessTokenDto) {
    return this.userValidatorService.validateUserByToken(data.accessToken);
  }
}
