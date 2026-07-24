import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthMessage,
  AuthenticatedUser,
  DataPayload,
  IsPublic,
  ResponseMessage,
  ValidationPipe,
} from '@ross2p/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { refreshTokenSchema } from '@ross2p/types';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { accessTokenSchema } from './dto/access-token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @IsPublic()
  @HttpCode(200)
  @ResponseMessage('Access token refreshed')
  @ApiOperation({ summary: 'Mint a new access token from a refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New access JWT and decoded payload',
    type: TokenPayloadDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh blocked until email/2FA challenges complete',
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh expired or invalid',
  })
  async refreshAccessToken(
    @Body(new ValidationPipe(refreshTokenSchema))
    refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenPayloadDto> {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }

  @MessagePattern(AuthMessage.USER_VALIDATE)
  async validateUserByToken(
    @DataPayload(new ValidationPipe(accessTokenSchema)) data: AccessTokenDto,
  ): Promise<AuthenticatedUser> {
    return this.authService.validateUserByToken(data.accessToken);
  }
}
