import {
  TokensDto,
  UserEntity,
  UserTokensDto,
  RefreshTokenDto,
  GenerateTokensDto,
} from '@ross2p/types';
import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ClientService,
  Services,
  TokenCommand,
} from '@ross2p/common';
import { SessionProvider } from '@ross2p/database';
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
    this.userService.subscribeToResponseOf('user.findUserById');
    this.tokenService.subscribeToResponseOf(TokenCommand.GENERATE);
    this.tokenService.subscribeToResponseOf(TokenCommand.REFRESH);
    await this.userService.connect();
    await this.tokenService.connect();
  }

  async refreshAccessToken(refreshTokenDto: RefreshTokenDto): Promise<TokensDto> {
    const session = await this.sessionService.findByRefreshToken(
      refreshTokenDto.refreshToken,
    );
    if (!session) {
      throw new UnauthorizedException(
        'Refresh token not found in any active session',
      );
    }

    const tokens = await this.tokenService.sendAndReturnPromise<
      TokensDto,
      RefreshTokenDto
    >(TokenCommand.REFRESH, refreshTokenDto);

    await this.sessionService.updateSession(session.id, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async generateTokensByUserEntity(
    user: UserEntity,
    is2faVerified = true,
  ): Promise<UserTokensDto> {
    const tokens = await this.tokenService.sendAndReturnPromise<
      TokensDto,
      GenerateTokensDto
    >(TokenCommand.GENERATE, {
      id: user.id,
      email: user.email,
      is2faVerified,
    });
    return {
      ...tokens,
      user,
      is2faEnabled: (user as UserEntity & { is2fa?: boolean }).is2fa ?? false,
    };
  }

  async generateTokensByUserId(userId: string): Promise<UserTokensDto> {
    const user = await this.userService.sendAndReturnPromise<
      UserEntity,
      { userId: string }
    >('user.findUserById', { userId });
    return this.generateTokensByUserEntity(user);
  }

  async signIn(userId: string) {
    const { user, ...tokens } = await this.generateTokensByUserId(userId);
    await this.sessionService.createSession({
      userId,
      refreshToken: tokens.refreshToken,
      userAgent: '',
      ipAddress: '',
      provider: SessionProvider.CREDENTIALS,
      refreshAt: new Date(),
      expiresAt: new Date(),
    });
    return { user, ...tokens };
  }
}
