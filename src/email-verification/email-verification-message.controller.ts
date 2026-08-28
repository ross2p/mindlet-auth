import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { VerifyEmailMessageDto } from './dto/verify-email-message.dto';
import { EmailVerificationService } from './email-verification.service';

@Controller()
export class EmailVerificationMessageController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @MessagePattern(AuthMessage.EMAIL_RESEND_CODE)
  resendEmailVerificationCode(@DataPayload() data: SessionIdMessageDto) {
    return this.emailVerificationService.sendCode({
      sessionId: data.sessionId,
    });
  }

  @MessagePattern(AuthMessage.EMAIL_VERIFY)
  verifyEmail(@DataPayload() data: VerifyEmailMessageDto) {
    return this.emailVerificationService.checkCode({
      userId: data.userId,
      sessionId: data.sessionId,
      email: data.email,
      code: data.code,
    });
  }
}
