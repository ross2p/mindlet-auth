import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCoreProto,
  AuthMessage,
  AuthenticatedUser,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
  ValidationPipe,
} from '@ross2p/common';
import { refreshTokenSchema } from '@ross2p/types';
import { AuthService } from './auth.service';
import { toAuthenticatedUserMessage, toTokenPayload } from './auth.grpc-mapper';
import { AccessTokenDto } from './dto/access-token.dto';
import { accessTokenSchema } from './dto/access-token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Controller()
@AuthCoreProto.AuthCoreServiceControllerMethods()
export class AuthController implements AuthCoreProto.AuthCoreServiceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AuthMessage.USER_VALIDATE)
  validateUserByToken(
    @DataPayload(new ValidationPipe(accessTokenSchema)) data: AccessTokenDto,
  ): Promise<AuthenticatedUser> {
    return this.authService.validateUserByToken(data.accessToken);
  }

  @MessagePattern(AuthMessage.REFRESH)
  refreshAccessToken(
    @DataPayload(new ValidationPipe(refreshTokenSchema))
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenPayloadDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async validateUser(
    data: AuthCoreProto.ValidateUserRequest,
  ): Promise<AuthCoreProto.AuthenticatedUserMessage> {
    const { accessToken } = new ValidationPipe(accessTokenSchema).transform(
      data,
    );
    const user = await this.authService.validateUserByToken(accessToken);
    return toAuthenticatedUserMessage(user);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async refreshToken(
    data: AuthCoreProto.RefreshTokenRequest,
  ): Promise<AuthCoreProto.TokenPayload> {
    const dto = new ValidationPipe(refreshTokenSchema).transform(data);
    const result = await this.authService.refreshAccessToken(dto);
    return toTokenPayload(result);
  }
}
