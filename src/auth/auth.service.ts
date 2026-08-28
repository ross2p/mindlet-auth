import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  AuthenticatedUser,
  ClientService,
  Services,
  UserQuery,
} from '@ross2p/common';
import { SessionService } from '../session/session.service';
import { UserTokenService } from '../token/user-token/user-token.service';
import type { AuthUserView } from './dto/auth-user.view';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import { TokensDto } from './dto/tokens.dto';
import { assertRefreshAllowed } from './refresh-gate.util';

@Injectable()
export class AuthService {
  constructor(
    private readonly userTokenService: UserTokenService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly sessionService: SessionService,
  ) {}

  async validateUserByToken(token: string): Promise<AuthenticatedUser> {
    const userPayload = this.userTokenService.validateAccessToken(token);

    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      userPayload.sessionId,
    );
    if (session.userId !== userPayload.id) {
      throw new UnauthorizedException(
        'The access token does not match the user linked to this session. Please sign in again.',
      );
    }

    return {
      id: userPayload.id,
      email: userPayload.email,
      sessionId: userPayload.sessionId,
      twoFactorVerifiedAt: userPayload.twoFactorVerifiedAt,
      emailVerifiedAt: userPayload.emailVerifiedAt,
    };
  }

  async refreshAccessToken(dto: RefreshTokenDto): Promise<TokenPayloadDto> {
    const payload = this.userTokenService.verifyRefreshToken(dto.refreshToken);

    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      payload.sessionId,
    );
    if (session.userId !== payload.id) {
      throw new UnauthorizedException(
        'The refresh token session does not belong to the signed-in user. Please sign in again.',
      );
    }

    await this.sessionService.verifyRefreshTokenHash(
      payload.id,
      payload.sessionId,
      dto.refreshToken,
    );

    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId: session.userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    assertRefreshAllowed({
      emailVerifiedAt: user.emailVerifiedAt,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorVerifiedAt: session.twoFactorVerifiedAt,
    });

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

    const tokens = this.userTokenService.generateTokens({
      id: user.id,
      email: user.email,
      sessionId: session.id,
      twoFactorVerifiedAt: session.twoFactorVerifiedAt ?? null,
      emailVerifiedAt: user.emailVerifiedAt,
      pendingVerification,
    });
    await this.sessionService.persistRefreshTokenHash(
      session.id,
      tokens.refreshToken.token,
    );
    return tokens;
  }
}
