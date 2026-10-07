import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthCoreProto,
  AuthTwoFactorProto,
} from '@ross2p/common';
import { TwoFactorService } from './two-factor.service';

@Controller()
export class TwoFactorController
  implements AuthTwoFactorProto.TwoFactorServiceController
{
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @GrpcMethod('TwoFactorService', 'findTwoFactorChallenge')
  async findTwoFactorChallenge(
    data: AuthTwoFactorProto.TwoFactorSessionRequest,
  ): Promise<AuthTwoFactorProto.TwoFactorChallenge> {
    const result = await this.twoFactorService.listTwoFactorMethods(data);
    return { required: true, methods: result.methods };
  }

  @GrpcMethod('TwoFactorService', 'resendTwoFactorCode')
  async resendTwoFactorCode(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorService.sendCode({ sessionId: data.sessionId });
    return {};
  }

  @GrpcMethod('TwoFactorService', 'verifyTwoFactorCode')
  async verifyTwoFactorCode(
    data: AuthTwoFactorProto.VerifyTwoFactorCodeRequest,
  ): Promise<AuthCoreProto.TokenPayload> {
    const result = await this.twoFactorService.checkCode({
      userId: data.userId,
      sessionId: data.sessionId,
      code: data.code,
      method: data.method,
    });
    return result;
  }
}
