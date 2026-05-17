import { RefreshPayload, TokensDto, UserPayload } from '@ross2p/types';
import { Injectable } from '@nestjs/common';
import { GenerateTokensDto } from '../../auth/dto/generate-tokens.dto';
import { UserAccessTokenService } from './user-access-token.service';
import { UserRefreshTokenService } from './user-refresh-token.service';
import { ACCESS_PENDING_VERIFICATION_TTL_SECONDS } from '../token.constants';

@Injectable()
export class UserTokenService {
  constructor(
    private readonly accessTokenService: UserAccessTokenService,
    private readonly refreshTokenService: UserRefreshTokenService,
  ) {}

  generateTokens(dto: GenerateTokensDto): TokensDto {
    const accessPayload = {
      id: dto.id,
      email: dto.email,
      sessionId: dto.sessionId,
      twoFactorVerifiedAt: dto.twoFactorVerifiedAt,
      emailVerifiedAt: dto.emailVerifiedAt ?? null,
    };
    const refreshPayload = { id: dto.id, sessionId: dto.sessionId };
    const accessSignOptions =
      dto.pendingVerification === true
        ? { expiresIn: ACCESS_PENDING_VERIFICATION_TTL_SECONDS }
        : undefined;
    return {
      accessToken: this.accessTokenService.generateToken(
        accessPayload,
        accessSignOptions,
      ),
      refreshToken: this.refreshTokenService.generateToken(refreshPayload),
    };
  }

  validateAccessToken(token: string): UserPayload {
    return this.accessTokenService.verifyToken(token);
  }

  verifyRefreshToken(refreshToken: string): RefreshPayload {
    return this.refreshTokenService.verifyToken(refreshToken);
  }
}
