import {
  TokensDto,
  UserEntity,
  UserTokensDto,
  AccessTokenDto,
  RefreshTokenDto,
} from '@ross2p/types';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Services, ClientService, UserQuery } from '@ross2p/common';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @Inject(Services.TOKEN)
    private readonly tokenService: ClientService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    this.tokenService.subscribeToResponseOf('token.user.generate');
    await this.userService.connect();
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto) {
    const accessTokenDto = await this.tokenService.sendAndReturnPromise<
      AccessTokenDto,
      { refreshToken: string }
    >('token.user.access', { refreshToken: refreshTokenDto.refreshToken });

    return accessTokenDto;
  }

  async generateTokensByUserEntity(user: UserEntity): Promise<UserTokensDto> {
    const tokens = await this.tokenService.sendAndReturnPromise<
      TokensDto,
      UserEntity
    >('token.user.generate', user);
    return {
      ...tokens,
      user,
    };
  }

  async generateTokensByUserId(userId: string): Promise<UserTokensDto> {
    const user = await this.userService.sendAndReturnPromise<
      UserEntity,
      string
    >('user.getById', userId);
    return this.generateTokensByUserEntity(user);
  }

  async signIn(userId: string) {
    const refreshTokenDto: RefreshTokenDto =
      await this.tokenService.sendAndReturnPromise<RefreshTokenDto, string>(
        'token.user.refresh',
        userId,
      );

    const session = await this.sessionService.createSession({
      userId,
      refreshToken: refreshTokenDto.refreshToken,
      accessToken: '',
      userAgent: '',
      ipAddress: '',
      expiresAt: new Date(),
    });

    const accessTokenDto: AccessTokenDto =
      await this.tokenService.sendAndReturnPromise<AccessTokenDto>(
        'token.user.access',
        { session },
      );

    return {
      user: null,
      accessToken: accessTokenDto.accessToken,
      refreshToken: refreshTokenDto.refreshToken,
    };
  }
}
