import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthTwoFactorEnrollmentProto,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { ConfirmTwoFactorMessageDto } from './dto/confirm-two-factor-message.dto';
import { DisableTwoFactorMessageDto } from './dto/disable-two-factor-message.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';

@Controller()
@AuthTwoFactorEnrollmentProto.TwoFactorEnrollmentServiceControllerMethods()
export class TwoFactorEnrollmentController
  implements AuthTwoFactorEnrollmentProto.TwoFactorEnrollmentServiceController
{
  constructor(
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
  ) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_ENABLE)
  enableTwoFactorKafka(@DataPayload() data: UserIdMessageDto) {
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

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async enableTwoFactor(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.beginEnable(data.userId);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async confirmTwoFactorEnrollment(
    data: AuthTwoFactorEnrollmentProto.ConfirmTwoFactorEnrollmentRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.confirmEnable(data.userId, data.code);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async disableTwoFactorEnrollment(
    data: AuthTwoFactorEnrollmentProto.DisableTwoFactorEnrollmentRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorEnrollmentService.disable(data.userId, data.password);
    return {};
  }
}
