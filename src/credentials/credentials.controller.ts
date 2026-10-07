import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import { AuthCredentialsProto, AuthMessage, DataPayload } from '@ross2p/common';
import { CredentialsService } from './credentials.service';
import { toUserTokens } from './credentials.grpc-mapper';
import { LoginWithContext } from './dto/login-with-context.dto';
import { RegisterWithContext } from './dto/register-with-context.dto';

@Controller()
export class CredentialsController
  implements AuthCredentialsProto.CredentialsServiceController
{
  constructor(private readonly credentialsService: CredentialsService) {}

  @MessagePattern(AuthMessage.LOGIN)
  loginCredentialsEvent(@DataPayload() command: LoginWithContext) {
    return this.credentialsService.emailLogin(command);
  }

  @MessagePattern(AuthMessage.REGISTER)
  registerCredentialsEvent(@DataPayload() command: RegisterWithContext) {
    return this.credentialsService.emailRegister(command);
  }

  @GrpcMethod('CredentialsService', 'login')
  async login(
    data: AuthCredentialsProto.LoginRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailLogin(
      data as LoginWithContext,
    );
    return toUserTokens(result);
  }

  @GrpcMethod('CredentialsService', 'register')
  async register(
    data: AuthCredentialsProto.RegisterRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailRegister(
      data as RegisterWithContext,
    );
    return toUserTokens(result);
  }
}
