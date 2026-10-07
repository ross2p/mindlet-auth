import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthTwoFactorEnrollmentProto,
  DataPayload,
} from '@ross2p/common';
import { ConfirmTwoFactorMessageDto } from './dto/confirm-two-factor-message.dto';
import { DisableTwoFactorMessageDto } from './dto/disable-two-factor-message.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';

@Controller()
export class TwoFactorEnrollmentController
  implements AuthTwoFactorEnrollmentProto.TwoFactorEnrollmentServiceController
{
  constructor(
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
  ) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_ENABLE)
  enableTwoFactorEvent(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorEnrollmentService.beginEnable(data.userId);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_CONFIRM)
  confirmTwoFactorEvent(@DataPayload() data: ConfirmTwoFactorMessageDto) {
    return this.twoFactorEnrollmentService.confirmEnable(
      data.userId,
      data.code,
    );
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_DISABLE)
  disableTwoFactorEvent(@DataPayload() data: DisableTwoFactorMessageDto) {
    return this.twoFactorEnrollmentService.disable(data.userId, data.password);
  }

  @GrpcMethod('TwoFactorEnrollmentService', 'enableTwoFactor')
  async enableTwoFactor(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.beginEnable(data.userId);
    return {};
  }

  @GrpcMethod('TwoFactorEnrollmentService', 'confirmTwoFactorEnrollment')
  async confirmTwoFactorEnrollment(
    data: AuthTwoFactorEnrollmentProto.ConfirmTwoFactorEnrollmentRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.confirmEnable(data.userId, data.code);
    return {};
  }

  @GrpcMethod('TwoFactorEnrollmentService', 'disableTwoFactorEnrollment')
  async disableTwoFactorEnrollment(
    data: AuthTwoFactorEnrollmentProto.DisableTwoFactorEnrollmentRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.disable(data.userId, data.password);
    return {};
  }
}
