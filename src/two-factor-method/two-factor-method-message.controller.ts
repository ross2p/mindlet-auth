import {
  beginEnableSecondFactorMethodMessageSchema,
  confirmEnableSecondFactorMethodMessageSchema,
  disableSecondFactorMethodMessageSchema,
} from '@ross2p/types';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcRequest, ValidationPipe } from '@ross2p/common';
import {
  AuthCommonProto,
  AuthTwoFactorMethodProto,
} from '../../generated/protos';
import { TwoFactorMethodService } from './two-factor-method.service';
import {
  toEnableTwoFactorMethodResult,
  toTwoFactorMethodList,
} from './two-factor-method.grpc-mapper';

@Controller()
export class TwoFactorMethodMessageController
  implements AuthTwoFactorMethodProto.TwoFactorMethodServiceController
{
  constructor(
    private readonly twoFactorMethodService: TwoFactorMethodService,
  ) {}

  @GrpcMethod('TwoFactorMethodService', 'listTwoFactorMethods')
  async listTwoFactorMethods(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthTwoFactorMethodProto.TwoFactorMethodList> {
    const methods = await this.twoFactorMethodService.listMethods(data.userId);
    return toTwoFactorMethodList(methods);
  }

  @GrpcMethod('TwoFactorMethodService', 'beginEnableTwoFactorMethod')
  async beginEnableTwoFactorMethod(
    @GrpcRequest(new ValidationPipe(beginEnableSecondFactorMethodMessageSchema))
    dto: AuthTwoFactorMethodProto.BeginEnableTwoFactorMethodRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorMethodService.beginEnable(dto.userId, dto.type);
    return {};
  }

  @GrpcMethod('TwoFactorMethodService', 'confirmEnableTwoFactorMethod')
  async confirmEnableTwoFactorMethod(
    @GrpcRequest(
      new ValidationPipe(confirmEnableSecondFactorMethodMessageSchema),
    )
    dto: AuthTwoFactorMethodProto.ConfirmEnableTwoFactorMethodRequest,
  ): Promise<AuthTwoFactorMethodProto.EnableTwoFactorMethodResult> {
    const result = await this.twoFactorMethodService.confirmEnable(
      dto.userId,
      dto.type,
      dto.code,
    );
    return toEnableTwoFactorMethodResult(result);
  }

  @GrpcMethod('TwoFactorMethodService', 'disableTwoFactorMethod')
  async disableTwoFactorMethod(
    @GrpcRequest(new ValidationPipe(disableSecondFactorMethodMessageSchema))
    dto: AuthTwoFactorMethodProto.DisableTwoFactorMethodRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorMethodService.disable(dto.userId, dto.type);
    return {};
  }

  @GrpcMethod('TwoFactorMethodService', 'regenerateBackupCodes')
  async regenerateBackupCodes(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthTwoFactorMethodProto.EnableTwoFactorMethodResult> {
    const result = await this.twoFactorMethodService.regenerateBackupCodes(
      data.userId,
    );
    return toEnableTwoFactorMethodResult(result);
  }
}
