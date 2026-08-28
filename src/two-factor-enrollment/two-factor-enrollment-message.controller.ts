import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { ConfirmTwoFactorMessageDto } from './dto/confirm-two-factor-message.dto';
import { DisableTwoFactorMessageDto } from './dto/disable-two-factor-message.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';

@Controller()
export class TwoFactorEnrollmentMessageController {
  constructor(
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
  ) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_ENABLE)
  enableTwoFactor(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorEnrollmentService.beginEnable(data.userId);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_CONFIRM)
  confirmTwoFactor(@DataPayload() data: ConfirmTwoFactorMessageDto) {
    return this.twoFactorEnrollmentService.confirmEnable(
      data.userId,
      data.code,
    );
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_DISABLE)
  disableTwoFactor(@DataPayload() data: DisableTwoFactorMessageDto) {
    return this.twoFactorEnrollmentService.disable(data.userId, data.password);
  }
}
