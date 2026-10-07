import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthCommonProto, AuthTwoFactorEnrollmentProto } from '@ross2p/common';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';

@Controller()
export class TwoFactorEnrollmentController
  implements AuthTwoFactorEnrollmentProto.TwoFactorEnrollmentServiceController
{
  constructor(
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
  ) {}

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
