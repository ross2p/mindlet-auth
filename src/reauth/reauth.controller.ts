import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthReauthProto,
  DataPayload,
} from '@ross2p/common';
import { ReauthService } from './reauth.service';
import { VerifyReauthDto } from './dto/verify-reauth.dto';
import { CheckReauthDto } from './dto/check-reauth.dto';

@Controller()
export class ReauthController
  implements AuthReauthProto.ReauthServiceController
{
  constructor(private readonly reauthService: ReauthService) {}

  @MessagePattern(AuthMessage.REAUTH_VERIFY)
  verifyEvent(@DataPayload() data: VerifyReauthDto) {
    return this.reauthService.verifyPassword(data.userId, data.password);
  }

  @MessagePattern(AuthMessage.REAUTH_CHECK)
  checkEvent(@DataPayload() data: CheckReauthDto) {
    return this.reauthService.isVerified(data.userId);
  }

  @GrpcMethod('ReauthService', 'verifyReauth')
  async verifyReauth(
    data: AuthReauthProto.VerifyReauthRequest,
  ): Promise<AuthReauthProto.ReauthStatus> {
    const verified = await this.reauthService.verifyPassword(
      data.userId,
      data.password,
    );
    return { verified };
  }

  @GrpcMethod('ReauthService', 'checkReauth')
  async checkReauth(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthReauthProto.ReauthStatus> {
    const verified = await this.reauthService.isVerified(data.userId);
    return { verified };
  }
}
