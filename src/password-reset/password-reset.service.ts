import { NotificationGrpcClient } from '../notification-client/notification-grpc.client';
import type { ChangePasswordType, ForgotPasswordType } from '@ross2p/types';
import { Injectable } from '@nestjs/common';
import type { AuthUserView } from '../auth/types/auth-user.view';
import { UserService } from '../user-client/user-client.service';
import { ResetPasswordDto } from './types/reset-password.dto';
import { PasswordResetTokenService } from '../token/password-reset-token/password-reset-token.service';
import { SessionService } from '../session/session.service';
import { TwoFactorService } from '../two-factor/two-factor.service';
import { PasswordChangeRejected, ResetCodeInvalid } from '../auth.exceptions';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly passwordResetTokenService: PasswordResetTokenService,
    private readonly userService: UserService,
    private readonly notificationClient: NotificationGrpcClient,
    private readonly sessionService: SessionService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  // AC-14: missing, soft-deleted (UserErrorCode.deleted) and any other lookup failure all look
  // the same to the caller, so no error code needs inspecting.
  private findActiveUserByEmail(email: string): Promise<AuthUserView | null> {
    return this.userService.findUserByEmail(email).catch(() => null);
  }

  /** AC-14 — always succeeds; email only when an active User exists. */
  async forgotPassword(dto: ForgotPasswordType): Promise<void> {
    const user = await this.findActiveUserByEmail(dto.email);
    if (!user) {
      return;
    }

    const { token } = await this.passwordResetTokenService.create(user.email);
    await this.notificationClient.sendPasswordReset({
      userId: user.id,
      token,
    });
  }

  /** AC-13 / AC-15 — consume token, update password, revoke all Sessions. */
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const newPassword = dto.newPassword ?? dto.password;
    if (!newPassword) {
      throw new ResetCodeInvalid();
    }

    let email: string;
    try {
      ({ email } = await this.passwordResetTokenService.consume(dto.token));
    } catch {
      throw new ResetCodeInvalid();
    }

    const user = await this.userService.findUserByEmail(email);

    await this.userService.updateUserPrivateData({
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
    const user = await this.userService.findUserById(args.userId);

    if (user.twoFactorEnabled) {
      if (!args.twoFactorCode?.trim()) {
        throw new PasswordChangeRejected();
      }
      try {
        await this.twoFactorService.verifyChallengeCode({
          sessionId: args.sessionId,
          userId: args.userId,
          code: args.twoFactorCode,
        });
      } catch {
        throw new PasswordChangeRejected();
      }
    }

    const passwordOk = await this.userService
      .verifyPassword({ userId: args.userId, password: args.currentPassword })
      .then((result) => result.valid ?? false)
      .catch((): boolean => false);

    if (!passwordOk) {
      throw new PasswordChangeRejected();
    }

    await this.userService.updateUserPrivateData({
      userId: args.userId,
      password: args.newPassword,
    });
    await this.sessionService.signOutAll(args.userId, 'password-change');
  }

  /** Controller-friendly wrapper. */
  changePasswordFromDto(
    userId: string,
    sessionId: string,
    dto: ChangePasswordType,
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
