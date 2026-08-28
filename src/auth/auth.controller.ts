import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthMessage,
  AuthenticatedUser,
  DataPayload,
  ValidationPipe,
} from '@ross2p/common';
import { refreshTokenSchema } from '@ross2p/types';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { accessTokenSchema } from './dto/access-token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@Controller()
export class AuthController {
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
}
