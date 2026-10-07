import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AuthCommonProto, AuthReauthProto } from '@ross2p/common';
import { ReauthService } from './reauth.service';

@Controller()
export class ReauthController
  implements AuthReauthProto.ReauthServiceController
{
  constructor(private readonly reauthService: ReauthService) {}

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
