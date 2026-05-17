import { Body, Controller, Post } from '@nestjs/common';
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
import { TokenPayloadDto } from '@ross2p/types';
import { AuthService } from './auth.service';
import { AccessTokenDto } from './dto/access-token.dto';
import { accessTokenSchema } from './dto/access-token.schema';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @IsPublic()
  @ResponseMessage('Access token refreshed')
  @ApiOperation({ summary: 'Mint a new access token from a refresh token' })
  @ApiResponse({
    status: 200,
    description: 'New access JWT and decoded payload',
    type: TokenPayloadDto,
  })
  async refreshAccessToken(
    @Body() refreshTokenDto: RefreshTokenDto,
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
