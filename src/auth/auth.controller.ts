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
import { toTokenPayload } from './auth.grpc-mapper';
import { AccessTokenDto } from './dto/access-token.dto';
import { accessTokenSchema } from './dto/access-token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Controller()
export class AuthController implements AuthCoreProto.AuthCoreServiceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthMessage.USER_VALIDATE)
  validateUserByTokenEvent(
    @DataPayload(new ValidationPipe(accessTokenSchema)) data: AccessTokenDto,
  ): Promise<AuthenticatedUser> {
    return this.authService.validateUserByToken(data.accessToken);
  }

  @MessagePattern(AuthMessage.REFRESH)
  refreshAccessTokenEvent(
    @DataPayload(new ValidationPipe(refreshTokenSchema))
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenPayloadDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
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
    return toTokenPayload(result);
  }
}
