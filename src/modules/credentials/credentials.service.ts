import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { LoginDto, UserEntity, UserTokensDto } from '@ross2p/types';
import { checkExists } from '@ross2p/common';
import { Client, Services } from '@ross2p/messages';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class CredentialsService {
  constructor(
    @Inject(Services.USER) private readonly userService: Client,
    private readonly configService: ConfigService,
  ) {}

  public async login(loginDto: LoginDto): Promise<UserTokensDto> {
    console.log('Login attempt with email:', loginDto.email);
    // const user: UserEntity = await checkExists(
    //   this.userService.send('user.findUserByEmail', { email: loginDto.email }),
    //   'User not found',
    // );

    // const isPasswordValid = await this.userService.verifyUserPassword(
    //   user.id,
    //   loginDto.password,
    // );
    //
    // if (!isPasswordValid) {
    //   throw new NotFoundException('Invalid password');
    // }

    // const tokens = await this.tokenService.generateAccessTokens(user);

    return {
      user: {} as any,
      accessToken: '',
      refreshToken: '',
    };
  }

  public async register(loginDto: LoginDto): Promise<UserTokensDto> {
    console.log('Register attempt with email:', loginDto.email);
    try {
      const user: UserEntity = await firstValueFrom(
        this.userService.send<UserEntity>('user.findUserByEmail', {
          email: loginDto.email,
        }),
      );
    } catch (error) {
      console.error('Error finding user by email:', error);
    }

    // const isPasswordValid = await this.userService.verifyUserPassword(
    //   user.id,
    //   loginDto.password,
    // );
    //
    // if (!isPasswordValid) {
    //   throw new NotFoundException('Invalid password');
    // }

    // const tokens = await this.tokenService.generateAccessTokens(user);

    return {
      user: {} as any,
      accessToken: '',
      refreshToken: '',
    };
  }

  async onModuleInit() {
    this.userService.subscribeToResponseOf('user.findUserByEmail');
    await this.userService.connect();
  }
}
