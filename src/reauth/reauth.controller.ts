import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { ReauthService } from './reauth.service';
import { VerifyReauthDto } from './dto/verify-reauth.dto';
import { CheckReauthDto } from './dto/check-reauth.dto';

@Controller()
export class ReauthController {
  constructor(private readonly reauthService: ReauthService) {}

  @MessagePattern(AuthMessage.REAUTH_VERIFY)
  verify(@DataPayload() data: VerifyReauthDto) {
    return this.reauthService.verifyPassword(data.userId, data.password);
  }

  @MessagePattern(AuthMessage.REAUTH_CHECK)
  check(@DataPayload() data: CheckReauthDto) {
    return this.reauthService.isVerified(data.userId);
  }
}
