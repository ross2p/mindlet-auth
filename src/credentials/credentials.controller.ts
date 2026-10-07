import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthCredentialsProto } from '@ross2p/common';
import { CredentialsService } from './credentials.service';
import { LoginWithContext } from './types/login-with-context.dto';
import { RegisterWithContext } from './types/register-with-context.dto';

@Controller()
export class CredentialsController
  implements AuthCredentialsProto.CredentialsServiceController
{
  constructor(private readonly credentialsService: CredentialsService) {}

  @GrpcMethod('CredentialsService', 'login')
  async login(
    data: AuthCredentialsProto.LoginRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailLogin(
      data as LoginWithContext,
    );
    return result;
  }

  @GrpcMethod('CredentialsService', 'register')
  async register(
    data: AuthCredentialsProto.RegisterRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailRegister(
      data as RegisterWithContext,
    );
    return result;
  }
}
