import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthCoreProto,
  AuthMessage,
  AuthTwoFactorProto,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { SessionIdMessageDto } from './dto/session-id-message.dto';
import { TwoFactorSessionMessageDto } from './dto/two-factor-session-message.dto';
import { VerifyTwoFactorMessageDto } from './dto/verify-two-factor-message.dto';
import { TwoFactorService } from './two-factor.service';
import { toTwoFactorChallenge } from './two-factor.grpc-mapper';
import { toTokenPayload } from '../auth/auth.grpc-mapper';

@Controller()
@AuthTwoFactorProto.TwoFactorServiceControllerMethods()
export class TwoFactorController
  implements AuthTwoFactorProto.TwoFactorServiceController
{
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @MessagePattern(AuthMessage.TWO_FACTOR_METHODS)
  listTwoFactorMethods(@DataPayload() data: TwoFactorSessionMessageDto) {
    return this.twoFactorService.listTwoFactorMethods(data);
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_RESEND)
  resendTwoFactorCodeKafka(@DataPayload() data: SessionIdMessageDto) {
    return this.twoFactorService.sendCode({ sessionId: data.sessionId });
  }

  @MessagePattern(AuthMessage.TWO_FACTOR_VERIFY)
  verifyTwoFactor(@DataPayload() data: VerifyTwoFactorMessageDto) {
    return this.twoFactorService.checkCode({
      userId: data.userId,
      sessionId: data.sessionId,
      code: data.code,
      method: data.method,
    });
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async getTwoFactorChallenge(
    data: AuthTwoFactorProto.TwoFactorSessionRequest,
  ): Promise<AuthTwoFactorProto.TwoFactorChallenge> {
    const result = await this.twoFactorService.listTwoFactorMethods(data);
    return toTwoFactorChallenge(result);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async resendTwoFactorCode(
    data: AuthCommonProto.SessionIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.twoFactorService.sendCode({ sessionId: data.sessionId });
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
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
