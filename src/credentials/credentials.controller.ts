import {
  ClientInfo,
  ClientInfoType,
  IsPublic,
  ResponseMessage,
  ValidationPipe,
} from '@ross2p/common';
import { createUserSchema, loginSchema } from '@ross2p/types';
import { Body, Controller, Post } from '@nestjs/common';
import { CredentialsService } from './credentials.service';
import { Throttle } from '@nestjs/throttler';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginWithContext } from './dto/login-with-context.dto';
import { RegisterWithContext } from './dto/register-with-context.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { LOGIN_RATE_LIMIT } from '../auth-challenge.constants';

@ApiTags('Credentials')
@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Post('login')
  @IsPublic()
  @ResponseMessage('Login successful')
  @Throttle({
    default: {
      limit: LOGIN_RATE_LIMIT.limit,
      ttl: LOGIN_RATE_LIMIT.ttlMs,
    },
  })
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({
    status: 200,
    description:
      'Access and refresh tokens with user; short access TTL when verification is pending',
    type: UserTokensDto,
  })
  public async login(
    @Body(new ValidationPipe(loginSchema)) dto: LoginDto,
    @ClientInfo() info: ClientInfoType,
  ): Promise<UserTokensDto> {
    const command = Object.assign(new LoginWithContext(), dto, {
      ipAddress: info.ip ?? null,
      userAgent: info.userAgent ?? null,
    });
    return this.credentialsService.emailLogin(command);
  }

  @Post('register')
  @IsPublic()
  @ResponseMessage('Registration successful')
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ApiOperation({ summary: 'Register a new user with email and password' })
  @ApiResponse({
    status: 201,
    description:
      'Tokens issued; access token uses short TTL until email is verified via POST /auth/verify-email',
    type: UserTokensDto,
  })
  public async register(
    @Body(new ValidationPipe(createUserSchema)) dto: CreateUserDto,
    @ClientInfo() info: ClientInfoType,
  ): Promise<UserTokensDto> {
    const command = Object.assign(new RegisterWithContext(), dto, {
      ipAddress: info.ip ?? null,
      userAgent: info.userAgent ?? null,
    });
    return this.credentialsService.emailRegister(command);
  }
}
