import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCoreProto,
  AuthMessage,
  AuthenticatedUser,
  DataPayload,
  ValidationPipe,
} from '@ross2p/common';
import { refreshTokenSchema } from '@ross2p/types';
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
    data: AuthCoreProto.ValidateUserRequest,
  ): Promise<AuthCoreProto.AuthenticatedUserMessage> {
    const { accessToken } = new ValidationPipe(accessTokenSchema).transform(
      data,
    );
    return this.authService.validateUserByToken(accessToken);
  }

  @GrpcMethod('AuthCoreService', 'refreshToken')
  async refreshToken(
    data: AuthCoreProto.RefreshTokenRequest,
  ): Promise<AuthCoreProto.TokenPayload> {
    const dto = new ValidationPipe(refreshTokenSchema).transform(data);
    const result = await this.authService.refreshAccessToken(dto);
    return result;
  }
}
