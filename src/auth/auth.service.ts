import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientService, Services, UserQuery } from '@ross2p/common';
import { TokenPayloadDto, TokensDto } from '@ross2p/types';
import { SessionService } from '../session/session.service';
import { UserTokenService } from '../token/user-token/user-token.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { AuthUserView } from './dto/auth-user.view';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokenService: UserTokenService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly sessionService: SessionService,
  ) {}

  async refreshAccessToken(dto: RefreshTokenDto): Promise<TokenPayloadDto> {
    const payload = this.userTokenService.verifyRefreshToken(dto.refreshToken);

    await this.sessionService.verifyRefreshTokenHash(
      payload.id,
      payload.sessionId,
      dto.refreshToken,
    );
    await this.sessionService.updateLastUsedAt(payload.sessionId);
    return this.refreshAccessTokenBySessionId(payload.sessionId);
  }

  async refreshAccessTokenBySessionId(
    sessionId: string,
  ): Promise<TokenPayloadDto> {
    const { accessToken } = await this.generateTokens({ sessionId });
    return accessToken;
  }

  async generateTokens(params: { sessionId: string }): Promise<TokensDto> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      params.sessionId,
    );
    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId: session.userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const pendingVerification = user.emailVerifiedAt == null;

    return this.userTokenService.generateTokens({
      id: user.id,
      email: user.email,
      sessionId: session.id,
      twoFactorVerifiedAt: session.twoFactorVerifiedAt ?? null,
      emailVerifiedAt: user.emailVerifiedAt,
      pendingVerification,
    });
  }
}
