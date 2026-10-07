import {
  beginEnableSecondFactorMethodMessageSchema,
  confirmEnableSecondFactorMethodMessageSchema,
  disableSecondFactorMethodMessageSchema,
} from '@ross2p/types';
import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthTwoFactorMethodProto,
  ValidationPipe,
  DataPayload,
} from '@ross2p/common';
import { BeginEnableSecondFactorMethodDto } from './dto/begin-enable-second-factor-method.dto';
import { ConfirmEnableSecondFactorMethodDto } from './dto/confirm-enable-second-factor-method.dto';
import { DisableSecondFactorMethodDto } from './dto/disable-second-factor-method.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
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

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_LIST)
  listMethodsEvent(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorMethodService.listMethods(data.userId);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_BEGIN_ENABLE)
  beginEnableEvent(
    @DataPayload(new ValidationPipe(beginEnableSecondFactorMethodMessageSchema))
    data: BeginEnableSecondFactorMethodDto,
  ) {
    return this.twoFactorMethodService.beginEnable(data.userId, data.type);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_CONFIRM_ENABLE)
  confirmEnableEvent(
    @DataPayload(
      new ValidationPipe(confirmEnableSecondFactorMethodMessageSchema),
    )
    data: ConfirmEnableSecondFactorMethodDto,
  ) {
    return this.twoFactorMethodService.confirmEnable(
      data.userId,
      data.type,
      data.code,
    );
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_DISABLE)
  disableEvent(
    @DataPayload(new ValidationPipe(disableSecondFactorMethodMessageSchema))
    data: DisableSecondFactorMethodDto,
  ) {
    return this.twoFactorMethodService.disable(data.userId, data.type);
  }

  @MessagePattern(AuthMessage.BACKUP_CODES_REGENERATE)
  regenerateBackupCodesEvent(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorMethodService.regenerateBackupCodes(data.userId);
  }

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
