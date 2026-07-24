import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientService,
  Services,
  UserMessage,
  UserQuery,
} from '@ross2p/common';
import { AuthService } from '../auth/auth.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { SessionService } from '../session/session.service';
import { SessionProvider } from '../session/session-provider.enum';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { CreateUserDto } from './dto/create-user.dto';
import type { LoginWithContext } from './dto/login-with-context.dto';
import type { RegisterWithContext } from './dto/register-with-context.dto';
import { UserTokensDto } from './dto/user-tokens.dto';
import { mapAuthUserViewToAuthUserDto } from './map-auth-user-to-dto';
import { computePlatformAccessOpen } from '../platform-access.util';
import { buildTwoFactorChallenge } from '../two-factor/two-factor-methods.util';

@Injectable()
export class CredentialsService implements OnModuleInit {
  constructor(
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
    private readonly sessionService: SessionService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserMessage.CREATE);
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_EMAIL);
    this.userService.subscribeToResponseOf(UserMessage.VERIFY_PASSWORD);
    await this.userService.connect();
  }

  private async loadUserByEmail(email: string): Promise<AuthUserView | null> {
    try {
      return await this.userService.sendAndReturnPromise<AuthUserView>(
        UserQuery.GET_BY_EMAIL,
        { email },
      );
    } catch (err) {
      if (
        err instanceof ForbiddenException ||
        (err as { status?: number })?.status === 403 ||
        String((err as Error)?.message ?? '').includes('unavailable')
      ) {
        throw new BadRequestException(
          'Sign-in is unavailable for these credentials',
        );
      }
      return null;
    }
  }

  async emailLogin(command: LoginWithContext): Promise<UserTokensDto> {
    const user = await this.loadUserByEmail(command.email);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid: boolean = await this.userService
      .sendAndReturnPromise<boolean>(UserMessage.VERIFY_PASSWORD, {
        userId: user.id,
        password: command.password,
      })
      .catch((): boolean => false);

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      provider: SessionProvider.CREDENTIALS,
      refreshAt: new Date(),
      expiresAt: new Date(),
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
    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      CreateUserDto
    >(UserMessage.CREATE, command);

    const session = await this.sessionService.createSession({
      userId: user.id,
      userAgent: command.userAgent,
      ipAddress: command.ipAddress,
      provider: SessionProvider.CREDENTIALS,
      refreshAt: new Date(),
      expiresAt: new Date(),
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
