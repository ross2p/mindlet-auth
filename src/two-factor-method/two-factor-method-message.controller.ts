import {
  beginEnableSecondFactorMethodMessageSchema,
  confirmEnableSecondFactorMethodMessageSchema,
  disableSecondFactorMethodMessageSchema,
} from '@ross2p/types';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthTwoFactorMethodProto,
  ValidationPipe,
} from '@ross2p/common';
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
    data: AuthTwoFactorMethodProto.BeginEnableTwoFactorMethodRequest,
  ): Promise<AuthCommonProto.Empty> {
    const dto = new ValidationPipe(
      beginEnableSecondFactorMethodMessageSchema,
    ).transform(data);
    await this.twoFactorMethodService.beginEnable(dto.userId, dto.type);
    return {};
  }

  @GrpcMethod('TwoFactorMethodService', 'confirmEnableTwoFactorMethod')
  async confirmEnableTwoFactorMethod(
    data: AuthTwoFactorMethodProto.ConfirmEnableTwoFactorMethodRequest,
  ): Promise<AuthTwoFactorMethodProto.EnableTwoFactorMethodResult> {
    const dto = new ValidationPipe(
      confirmEnableSecondFactorMethodMessageSchema,
    ).transform(data);
    const result = await this.twoFactorMethodService.confirmEnable(
      dto.userId,
      dto.type,
      dto.code,
    );
    return toEnableTwoFactorMethodResult(result);
  }

  @GrpcMethod('TwoFactorMethodService', 'disableTwoFactorMethod')
  async disableTwoFactorMethod(
    data: AuthTwoFactorMethodProto.DisableTwoFactorMethodRequest,
  ): Promise<AuthCommonProto.Empty> {
    const dto = new ValidationPipe(
      disableSecondFactorMethodMessageSchema,
    ).transform(data);
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
