import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthCoreProto,
  AuthEmailVerificationProto,
} from '@ross2p/common';
import { EmailVerificationService } from './email-verification.service';

@Controller()
export class EmailVerificationController
  implements AuthEmailVerificationProto.EmailVerificationServiceController
{
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @GrpcMethod('EmailVerificationService', 'resendEmailVerificationCode')
  async resendEmailVerificationCode(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthEmailVerificationProto.EmailVerification> {
    return this.emailVerificationService.sendCode({
      sessionId: data.sessionId,
    });
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
    return result;
  }
}
