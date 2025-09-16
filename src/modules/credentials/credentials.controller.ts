import { ResponseMessage, ValidationPipe } from '@ross2p/common';
import {
  CreateUserDto,
  LoginDto,
  UserTokensDto,
  createUserSchema,
  loginSchema,
} from '@ross2p/types';
import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('login')
  @ResponseMessage('Login successful')
  public async login(
    @Body(new ValidationPipe(loginSchema)) loginDto: LoginDto,
  ): Promise<UserTokensDto> {
    return this.credentialsService.emailLogin(loginDto);
  }

  @Post('register')
  @ResponseMessage('Registration successful')
  public async register(
    @Body(new ValidationPipe(createUserSchema)) registerDto: CreateUserDto,
  ): Promise<UserTokensDto> {
    return this.credentialsService.emailRegister(registerDto);
  }
}
