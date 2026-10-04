import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthPasswordResetProto,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { ChangePasswordMessageDto } from './dto/change-password-message.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { PasswordResetService } from './password-reset.service';

@Controller()
@AuthPasswordResetProto.PasswordResetServiceControllerMethods()
export class PasswordResetController
  implements AuthPasswordResetProto.PasswordResetServiceController
{
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @MessagePattern(AuthMessage.FORGOT_PASSWORD)
  forgotPasswordKafka(@DataPayload() body: ForgotPasswordDto) {
    return this.passwordResetService.forgotPassword(body);
  }

  @MessagePattern(AuthMessage.RESET_PASSWORD)
  resetPasswordKafka(@DataPayload() body: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(body);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD_REQUEST_2FA)
  requestChangePassword2fa(@DataPayload() data: SessionIdMessageDto) {
    return this.passwordResetService.requestChangePassword2fa(data.sessionId);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD)
  changePasswordKafka(@DataPayload() data: ChangePasswordMessageDto) {
    return this.passwordResetService.changePasswordFromDto(
      data.userId,
      data.sessionId,
      data,
    );
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async forgotPassword(
    data: AuthPasswordResetProto.ForgotPasswordRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.forgotPassword(data);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async resetPassword(
    data: AuthPasswordResetProto.ResetPasswordRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.resetPassword(data);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async requestChangePasswordTwoFactor(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.passwordResetService.requestChangePassword2fa(data.sessionId);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
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
