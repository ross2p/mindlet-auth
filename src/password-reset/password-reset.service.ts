import {
  ForbiddenException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientService,
  NotificationMessage,
  Services,
  UserMessage,
  UserPrivateMessage,
  UserQuery,
} from '@ross2p/common';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PasswordResetTokenService } from '../token/password-reset-token/password-reset-token.service';
import { SessionService } from '../session/session.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { AuthErrorCode, throwAuthBadRequest } from '../auth-exception';

@Injectable()
export class PasswordResetService implements OnModuleInit {
  constructor(
    private readonly passwordResetTokenService: PasswordResetTokenService,
    @Inject(Services.USER) private readonly userService: ClientService,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: ClientService,
    private readonly sessionService: SessionService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_EMAIL);
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    this.userService.subscribeToResponseOf(UserPrivateMessage.UPDATE);
    this.userService.subscribeToResponseOf(UserMessage.VERIFY_PASSWORD);
    this.notificationClient.subscribeToResponseOf(
      NotificationMessage.SEND_PASSWORD_RESET,
    );
    await this.userService.connect();
    await this.notificationClient.connect();
  }

  private async findActiveUserByEmail(
    email: string,
  ): Promise<AuthUserView | null> {
    try {
      return await this.userService.sendAndReturnPromise<
        AuthUserView,
        { email: string }
      >(UserQuery.GET_BY_EMAIL, { email });
    } catch (err) {
      if (
        err instanceof ForbiddenException ||
        (err as { status?: number })?.status === 403
      ) {
        return null;
      }
      return null;
    }
  }

  /** AC-14 — always succeeds; email only when an active User exists. */
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.findActiveUserByEmail(dto.email);
    if (!user) {
      return;
    }

    const { token } = await this.passwordResetTokenService.create(user.email);
    await this.notificationClient.sendAndReturnPromise(
      NotificationMessage.SEND_PASSWORD_RESET,
      {
        userId: user.id,
        token,
      },
    );
  }

  /** AC-13 / AC-15 — consume token, update password, revoke all Sessions. */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const newPassword = dto.newPassword ?? dto.password;
    if (!newPassword) {
      throwAuthBadRequest(
        AuthErrorCode.resetCodeInvalid,
        'Reset code expired or already used — request a new one',
      );
    }

    let email: string;
    try {
      ({ email } = await this.passwordResetTokenService.consume(dto.token));
    } catch {
      throwAuthBadRequest(
        AuthErrorCode.resetCodeInvalid,
        'Reset code expired or already used — request a new one',
      );
    }

    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { email: string }
    >(UserQuery.GET_BY_EMAIL, { email });

    await this.userService.sendAndReturnPromise(UserPrivateMessage.UPDATE, {
      userId: user.id,
      password: newPassword,
    });
    await this.sessionService.signOutAll(user.id, 'password-reset');
  }

  requestChangePassword2fa(sessionId: string): Promise<void> {
    return this.twoFactorService.sendStepUpCode({ sessionId });
  }

  /** AC-17 — confirm current credentials (+ 2FA when enabled), then revoke-all. */
  async changePassword(args: {
    userId: string;
    sessionId: string;
    currentPassword: string;
    newPassword: string;
    twoFactorCode?: string | null;
  }): Promise<void> {
    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId: args.userId });

    if (user.twoFactorEnabled) {
      if (!args.twoFactorCode?.trim()) {
        throwAuthBadRequest(
          AuthErrorCode.passwordChangeRejected,
          'Current credentials were not confirmed',
        );
      }
      try {
        await this.twoFactorService.verifyChallengeCode({
          sessionId: args.sessionId,
          userId: args.userId,
          code: args.twoFactorCode,
        });
      } catch {
        throwAuthBadRequest(
          AuthErrorCode.passwordChangeRejected,
          'Current credentials were not confirmed',
        );
      }
    }

    const passwordOk = await this.userService
      .sendAndReturnPromise<boolean>(UserMessage.VERIFY_PASSWORD, {
        userId: args.userId,
        password: args.currentPassword,
      })
      .catch((): boolean => false);

    if (!passwordOk) {
      throwAuthBadRequest(
        AuthErrorCode.passwordChangeRejected,
        'Current credentials were not confirmed',
      );
    }

    await this.userService.sendAndReturnPromise(UserPrivateMessage.UPDATE, {
      userId: args.userId,
      password: args.newPassword,
    });
    await this.sessionService.signOutAll(args.userId, 'password-change');
  }

  /** Controller-friendly wrapper. */
  changePasswordFromDto(
    userId: string,
    sessionId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    return this.changePassword({
      userId,
      sessionId,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
      twoFactorCode: dto.twoFactorCode,
    });
  }
}
