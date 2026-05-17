import { Global, Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { PASSWORD_RESET_TTL_SECONDS } from '../password-reset/password-reset.constants';
import { PasswordResetTokenRepository } from './password-reset-token/password-reset-token.repository';
import { PasswordResetTokenService } from './password-reset-token/password-reset-token.service';
import { UserAccessTokenModule } from './user-token/user-access-token.module';
import { UserRefreshTokenModule } from './user-token/user-refresh-token.module';
import { UserTokenService } from './user-token/user-token.service';

@Global()
@Module({
  imports: [
    UserAccessTokenModule,
    UserRefreshTokenModule,
    CacheModule.forFeature({
      prefix: 'auth:password-reset',
      defaultTtlSeconds: PASSWORD_RESET_TTL_SECONDS,
    }),
  ],
  providers: [
    PasswordResetTokenRepository,
    PasswordResetTokenService,
    UserTokenService,
  ],
  exports: [UserTokenService, PasswordResetTokenService],
})
export class TokenModule {}
