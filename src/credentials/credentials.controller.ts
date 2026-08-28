import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { CredentialsService } from './credentials.service';
import { LoginWithContext } from './dto/login-with-context.dto';
import { RegisterWithContext } from './dto/register-with-context.dto';

@Controller()
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @MessagePattern(AuthMessage.LOGIN)
  loginCredentials(@DataPayload() command: LoginWithContext) {
    return this.credentialsService.emailLogin(command);
  }

  @MessagePattern(AuthMessage.REGISTER)
  registerCredentials(@DataPayload() command: RegisterWithContext) {
    return this.credentialsService.emailRegister(command);
  }
}
