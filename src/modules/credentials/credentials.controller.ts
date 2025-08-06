import { ResponseMessage } from '@ross2p/common';
import { LoginDto, UserTokensDto } from '@ross2p/types';
import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('login')
  @ResponseMessage('Login successful')
  public async login(@Body() loginDto: LoginDto): Promise<UserTokensDto> {
    return this.credentialsService.login(loginDto);
  }

  @Post('register')
  @ResponseMessage('Registration successful')
  public async register(@Body() loginDto: LoginDto): Promise<UserTokensDto> {
    return this.credentialsService.register(loginDto);
  }
}
