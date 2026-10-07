import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthCoreProto,
  AuthMessage,
  AuthTwoFactorProto,
  DataPayload,
} from '@ross2p/common';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { TwoFactorSessionMessageDto } from './dto/two-factor-session-message.dto';
import { VerifyTwoFactorMessageDto } from './dto/verify-two-factor-message.dto';
import { TwoFactorService } from './two-factor.service';
import { toTwoFactorChallenge } from './two-factor.grpc-mapper';
import { toTokenPayload } from '../auth/auth.grpc-mapper';

@Controller()
export class TwoFactorController
  implements AuthTwoFactorProto.TwoFactorServiceController
{
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_METHODS)
  listTwoFactorMethodsEvent(@DataPayload() data: TwoFactorSessionMessageDto) {
    return this.twoFactorService.listTwoFactorMethods(data);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_RESEND)
  resendTwoFactorCodeEvent(@DataPayload() data: SessionIdMessageDto) {
    return this.twoFactorService.sendCode({ sessionId: data.sessionId });
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_VERIFY)
  verifyTwoFactorEvent(@DataPayload() data: VerifyTwoFactorMessageDto) {
    return this.twoFactorService.checkCode({
      userId: data.userId,
      sessionId: data.sessionId,
      code: data.code,
      method: data.method,
    });
  }

  @GrpcMethod('TwoFactorService', 'findTwoFactorChallenge')
  async findTwoFactorChallenge(
    data: AuthTwoFactorProto.TwoFactorSessionRequest,
  ): Promise<AuthTwoFactorProto.TwoFactorChallenge> {
    const result = await this.twoFactorService.listTwoFactorMethods(data);
    return toTwoFactorChallenge(result);
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
      method: data.method as VerifyTwoFactorMessageDto['method'],
    });
    return toTokenPayload(result);
  }
}
