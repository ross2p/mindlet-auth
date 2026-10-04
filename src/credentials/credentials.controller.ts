import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCredentialsProto,
  AuthMessage,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { CredentialsService } from './credentials.service';
import { toUserTokens } from './credentials.grpc-mapper';
import { LoginWithContext } from './dto/login-with-context.dto';
import { RegisterWithContext } from './dto/register-with-context.dto';

@Controller()
@AuthCredentialsProto.CredentialsServiceControllerMethods()
export class CredentialsController
  implements AuthCredentialsProto.CredentialsServiceController
{
  constructor(private readonly credentialsService: CredentialsService) {}

  @MessagePattern(AuthMessage.LOGIN)
  loginCredentials(@DataPayload() command: LoginWithContext) {
    return this.credentialsService.emailLogin(command);
  }

  @MessagePattern(AuthMessage.REGISTER)
  registerCredentials(@DataPayload() command: RegisterWithContext) {
    return this.credentialsService.emailRegister(command);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async login(
    data: AuthCredentialsProto.LoginRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailLogin(
      data as LoginWithContext,
    );
    return toUserTokens(result);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async register(
    data: AuthCredentialsProto.RegisterRequest,
  ): Promise<AuthCredentialsProto.UserTokens> {
    const result = await this.credentialsService.emailRegister(
      data as RegisterWithContext,
    );
    return toUserTokens(result);
  }
}
