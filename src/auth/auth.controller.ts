import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccessTokenDto, RefreshTokenDto } from '@ross2p/types';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto);
  }
}
