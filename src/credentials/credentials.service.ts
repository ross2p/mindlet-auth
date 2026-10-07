import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { SessionService } from '../session/session.service';
import { SessionProvider } from '../session/session-provider.enum';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { UserClient } from '../user-grpc/user-client.service';
import { toAuthUserView } from '../user-grpc/user-grpc-response.mapper';
import type { LoginWithContext } from './dto/login-with-context.dto';
import type { RegisterWithContext } from './dto/register-with-context.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { mapAuthUserViewToAuthUserDto } from './map-auth-user-to-dto';
import { computePlatformAccessOpen } from '../platform-access.util';
import { buildTwoFactorChallenge } from '../two-factor/two-factor-methods.util';
import { sessionExpiresAt } from '../auth-challenge.constants';
import { AuthErrorCode, throwAuthUnauthorized } from '../auth-exception';

@Injectable()
export class CredentialsService {
  constructor(
    private readonly userClient: UserClient,
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly sessionService: SessionService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  private async loadUserByEmail(email: string): Promise<AuthUserView | null> {
    try {
      return toAuthUserView(await this.userClient.findUserByEmail(email));
    } catch (err) {
      if (
        err instanceof ForbiddenException ||
        (err as { status?: number })?.status === 403 ||
        String((err as Error)?.message ?? '').includes('unavailable')
      ) {
        throwAuthUnauthorized(
          AuthErrorCode.signInUnavailable,
          'Sign-in is unavailable for these credentials',
        );
      }
      return null;
    }
  }

  async emailLogin(command: LoginWithContext): Promise<UserTokensDto> {
    const user = await this.loadUserByEmail(command.email);

    if (!user) {
      throwAuthUnauthorized(
        AuthErrorCode.signInUnavailable,
        'Sign-in is unavailable for these credentials',
      );
    }

    const isPasswordValid: boolean = await this.userClient
      .verifyPassword({ userId: user.id, password: command.password })
      .then((result) => result.valid ?? false)
      .catch((): boolean => false);

    if (!isPasswordValid) {
      throwAuthUnauthorized(
        AuthErrorCode.signInUnavailable,
        'Sign-in is unavailable for these credentials',
      );
    }

    const now = new Date();
    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      provider: SessionProvider.CREDENTIALS,
      refreshAt: now,
      expiresAt: sessionExpiresAt(now),
      twoFactorVerifiedAt: user.twoFactorEnabled ? null : new Date(),
    });

    if (user.twoFactorEnabled) {
      await this.twoFactorService.sendCode({
        sessionId: session.id,
      });
    }

    const tokens = await this.authService.generateTokens({
      sessionId: session.id,
    });
    const twoFactorChallenge = buildTwoFactorChallenge({
      twoFactorEnabled: user.twoFactorEnabled,
    });

    return {
      user: mapAuthUserViewToAuthUserDto(user),
      is2faEnabled: user.twoFactorEnabled,
      sessionId: session.id,
      platformAccessOpen: computePlatformAccessOpen({
        emailVerifiedAt: user.emailVerifiedAt,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorVerifiedAt: session.twoFactorVerifiedAt,
      }),
      twoFactorChallenge,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async emailRegister(command: RegisterWithContext): Promise<UserTokensDto> {
    const user = toAuthUserView(
      await this.userClient.createUser({
        email: command.email,
        firstName: command.firstName,
        lastName: command.lastName,
        password: command.password,
        avatarUrl: command.avatarUrl,
        phoneNumber: command.phoneNumber,
      }),
    );

    const now = new Date();
    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      provider: SessionProvider.CREDENTIALS,
      refreshAt: now,
      expiresAt: sessionExpiresAt(now),
      twoFactorVerifiedAt: user.twoFactorEnabled ? null : new Date(),
    });

    await this.emailVerificationService.sendCode({
      sessionId: session.id,
    });

    const tokens = await this.authService.generateTokens({
      sessionId: session.id,
    });

    return {
      user: mapAuthUserViewToAuthUserDto(user),
      is2faEnabled: user.twoFactorEnabled,
      sessionId: session.id,
      platformAccessOpen: computePlatformAccessOpen({
        emailVerifiedAt: user.emailVerifiedAt,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorVerifiedAt: session.twoFactorVerifiedAt,
      }),
      twoFactorChallenge: null,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
