import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthCoreProto,
  AuthEmailVerificationProto,
  AuthMessage,
  DataPayload,
} from '@ross2p/common';
import { toTokenPayload } from '../auth/auth.grpc-mapper';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { VerifyEmailMessageDto } from './dto/verify-email-message.dto';
import { EmailVerificationService } from './email-verification.service';
import { toEmailVerificationMessage } from './email-verification.grpc-mapper';

@Controller()
export class EmailVerificationController
  implements AuthEmailVerificationProto.EmailVerificationServiceController
{
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @MessagePattern(AuthMessage.EMAIL_RESEND_CODE)
  resendEmailVerificationCodeEvent(@DataPayload() data: SessionIdMessageDto) {
    return this.emailVerificationService.sendCode({
      sessionId: data.sessionId,
    });
  }

  @MessagePattern(AuthMessage.EMAIL_VERIFY)
  verifyEmailEvent(@DataPayload() data: VerifyEmailMessageDto) {
    return this.emailVerificationService.checkCode({
      id: data.id,
      userId: data.userId,
      sessionId: data.sessionId,
      email: data.email,
      code: data.code,
    });
  }

  @GrpcMethod('EmailVerificationService', 'resendEmailVerificationCode')
  async resendEmailVerificationCode(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthEmailVerificationProto.EmailVerification> {
    const result = await this.emailVerificationService.sendCode({
      sessionId: data.sessionId,
    });
    return toEmailVerificationMessage(result);
  }

  @GrpcMethod('EmailVerificationService', 'verifyEmail')
  async verifyEmail(
    data: AuthEmailVerificationProto.VerifyEmailRequest,
  ): Promise<AuthCoreProto.TokenPayload> {
    const result = await this.emailVerificationService.checkCode({
      id: data.id,
      userId: data.userId,
      sessionId: data.sessionId,
      email: data.email,
      code: data.code,
    });
    return toTokenPayload(result);
  }
}
