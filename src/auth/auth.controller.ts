import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenPayloadDto } from '@ross2p/types';
import { IsPublic, ResponseMessage } from '@ross2p/common';
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
}
