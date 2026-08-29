import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { TwoFactorSessionMessageDto } from './dto/two-factor-session-message.dto';
import { VerifyTwoFactorMessageDto } from './dto/verify-two-factor-message.dto';
import { TwoFactorService } from './two-factor.service';

@Controller()
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_METHODS)
  listTwoFactorMethods(@DataPayload() data: TwoFactorSessionMessageDto) {
    return this.twoFactorService.listTwoFactorMethods(data);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_RESEND)
  resendTwoFactorCode(@DataPayload() data: SessionIdMessageDto) {
    return this.twoFactorService.sendCode({ sessionId: data.sessionId });
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_VERIFY)
  verifyTwoFactor(@DataPayload() data: VerifyTwoFactorMessageDto) {
    return this.twoFactorService.checkCode({
      userId: data.userId,
      sessionId: data.sessionId,
      code: data.code,
      method: data.method,
    });
  }
}
