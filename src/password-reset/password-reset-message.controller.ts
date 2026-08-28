import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { ChangePasswordMessageDto } from './dto/change-password-message.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { PasswordResetService } from './password-reset.service';

@Controller()
export class PasswordResetMessageController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @MessagePattern(AuthMessage.FORGOT_PASSWORD)
  forgotPassword(@DataPayload() body: ForgotPasswordDto) {
    return this.passwordResetService.forgotPassword(body);
  }

  @MessagePattern(AuthMessage.RESET_PASSWORD)
  resetPassword(@DataPayload() body: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(body);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD_REQUEST_2FA)
  requestChangePassword2fa(@DataPayload() data: SessionIdMessageDto) {
    return this.passwordResetService.requestChangePassword2fa(data.sessionId);
  }

  @MessagePattern(AuthMessage.CHANGE_PASSWORD)
  changePassword(@DataPayload() data: ChangePasswordMessageDto) {
    return this.passwordResetService.changePasswordFromDto(
      data.userId,
      data.sessionId,
      data,
    );
  }
}
