import { Controller } from '@nestjs/common';
import { UserValidatorService } from './user-validator.service';
import { MessagePattern } from '@nestjs/microservices';
import { AuthCommand, DataPayload, ValidationPipe } from '@ross2p/common';
import { AccessTokenDto } from './access-token.dto';
import { accessTokenSchema } from './access-token.schema';

@Controller()
export class UserValidatorController {
  constructor(private readonly userValidatorService: UserValidatorService) {}

  @MessagePattern(AuthCommand.USER_VALIDATE)
  async validateUserByToken(
    @DataPayload(new ValidationPipe(accessTokenSchema)) data: AccessTokenDto,
  ) {
    return this.userValidatorService.validateUserByToken(data.accessToken);
  }
}
