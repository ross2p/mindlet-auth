import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthMessage,
  AuthenticatedUser,
  DataPayload,
  GrpcRequest,
  ValidationPipe,
} from '@ross2p/common';
import { AuthCoreProto } from '../../generated/protos';
import { refreshTokenSchema } from '@ross2p/types';
import type { RefreshTokenType } from '@ross2p/types';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './types/access-token.dto';
import { accessTokenSchema } from './types/access-token.schema';

@Controller()
export class AuthController implements AuthCoreProto.AuthCoreServiceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthMessage.USER_VALIDATE)
  validateUserByTokenEvent(
    @DataPayload(new ValidationPipe(accessTokenSchema)) data: AccessTokenDto,
  ): Promise<AuthenticatedUser> {
    return this.authService.validateUserByToken(data.accessToken);
  }

  @GrpcMethod('AuthCoreService', 'validateUser')
  async validateUser(
    @GrpcRequest(new ValidationPipe<AccessTokenDto>(accessTokenSchema))
    { accessToken }: AccessTokenDto,
  ): Promise<AuthCoreProto.AuthenticatedUserMessage> {
    return this.authService.validateUserByToken(accessToken);
  }

  @GrpcMethod('AuthCoreService', 'refreshToken')
  async refreshToken(
    @GrpcRequest(new ValidationPipe<RefreshTokenType>(refreshTokenSchema))
    dto: RefreshTokenType,
  ): Promise<AuthCoreProto.TokenPayload> {
    return this.authService.refreshAccessToken(dto);
  }
}
