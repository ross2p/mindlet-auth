import {
  beginEnableSecondFactorMethodMessageSchema,
  confirmEnableSecondFactorMethodMessageSchema,
  disableSecondFactorMethodMessageSchema,
} from '@ross2p/types';
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, ValidationPipe, DataPayload } from '@ross2p/common';
import { BeginEnableSecondFactorMethodDto } from './dto/begin-enable-second-factor-method.dto';
import { ConfirmEnableSecondFactorMethodDto } from './dto/confirm-enable-second-factor-method.dto';
import { DisableSecondFactorMethodDto } from './dto/disable-second-factor-method.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { TwoFactorMethodService } from './two-factor-method.service';

@Controller()
export class TwoFactorMethodMessageController {
  constructor(
    private readonly twoFactorMethodService: TwoFactorMethodService,
  ) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_LIST)
  listMethods(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorMethodService.listMethods(data.userId);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_BEGIN_ENABLE)
  beginEnable(
    @DataPayload(new ValidationPipe(beginEnableSecondFactorMethodMessageSchema))
    data: BeginEnableSecondFactorMethodDto,
  ) {
    return this.twoFactorMethodService.beginEnable(data.userId, data.type);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_METHOD_CONFIRM_ENABLE)
  confirmEnable(
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
  disable(
    @DataPayload(new ValidationPipe(disableSecondFactorMethodMessageSchema))
    data: DisableSecondFactorMethodDto,
  ) {
    return this.twoFactorMethodService.disable(data.userId, data.type);
  }

  @MessagePattern(AuthMessage.BACKUP_CODES_REGENERATE)
  regenerateBackupCodes(@DataPayload() data: UserIdMessageDto) {
    return this.twoFactorMethodService.regenerateBackupCodes(data.userId);
  }
}
