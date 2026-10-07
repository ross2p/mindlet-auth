import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthPasswordResetProto,
  DataPayload,
} from '@ross2p/common';
import { ChangePasswordMessageDto } from './dto/change-password-message.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { PasswordResetService } from './password-reset.service';

@Controller()
export class PasswordResetController
  implements AuthPasswordResetProto.PasswordResetServiceController
{
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @MessagePattern(AuthMessage.FORGOT_PASSWORD)
  forgotPasswordEvent(@DataPayload() body: ForgotPasswordDto) {
    return this.passwordResetService.forgotPassword(body);
  }

  @MessagePattern(AuthMessage.RESET_PASSWORD)
  resetPasswordEvent(@DataPayload() body: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(body);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD_REQUEST_2FA)
  requestChangePassword2faEvent(@DataPayload() data: SessionIdMessageDto) {
    return this.passwordResetService.requestChangePassword2fa(data.sessionId);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD)
  changePasswordEvent(@DataPayload() data: ChangePasswordMessageDto) {
    return this.passwordResetService.changePasswordFromDto(
      data.userId,
      data.sessionId,
      data,
    );
  }

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
      data as unknown as ChangePasswordMessageDto,
    );
    return {};
  }
}
