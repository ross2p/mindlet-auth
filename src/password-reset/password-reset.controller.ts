import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthCommonProto, AuthPasswordResetProto } from '@ross2p/common';
import { PasswordResetService } from './password-reset.service';

@Controller()
export class PasswordResetController
  implements AuthPasswordResetProto.PasswordResetServiceController
{
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @GrpcMethod('PasswordResetService', 'forgotPassword')
  async forgotPassword(
    data: AuthPasswordResetProto.ForgotPasswordRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.forgotPassword(data);
    return {};
  }

  @GrpcMethod('PasswordResetService', 'resetPassword')
  async resetPassword(
    data: AuthPasswordResetProto.ResetPasswordRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.resetPassword({
      token: data.token,
      password: data.password ?? undefined,
      newPassword: data.newPassword ?? undefined,
    });
    return {};
  }

  @GrpcMethod('PasswordResetService', 'requestChangePasswordTwoFactor')
  async requestChangePasswordTwoFactor(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.requestChangePassword2fa(data.sessionId);
    return {};
  }

  @GrpcMethod('PasswordResetService', 'changePassword')
  async changePassword(
    data: AuthPasswordResetProto.ChangePasswordRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.changePasswordFromDto(
      data.userId,
      data.sessionId,
      data,
    );
    return {};
  }
}
