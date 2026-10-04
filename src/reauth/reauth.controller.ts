import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthReauthProto,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { ReauthService } from './reauth.service';
import { VerifyReauthDto } from './dto/verify-reauth.dto';
import { CheckReauthDto } from './dto/check-reauth.dto';

@Controller()
@AuthReauthProto.ReauthServiceControllerMethods()
export class ReauthController
  implements AuthReauthProto.ReauthServiceController
{
  constructor(private readonly reauthService: ReauthService) {}

  @MessagePattern(AuthMessage.REAUTH_VERIFY)
  verify(@DataPayload() data: VerifyReauthDto) {
    return this.reauthService.verifyPassword(data.userId, data.password);
  }

  @MessagePattern(AuthMessage.REAUTH_CHECK)
  check(@DataPayload() data: CheckReauthDto) {
    return this.reauthService.isVerified(data.userId);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async verifyReauth(
    data: AuthReauthProto.VerifyReauthRequest,
  ): Promise<AuthReauthProto.ReauthStatus> {
    const verified = await this.reauthService.verifyPassword(
      data.userId,
      data.password,
    );
    return { verified };
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async checkReauth(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthReauthProto.ReauthStatus> {
    const verified = await this.reauthService.isVerified(data.userId);
    return { verified };
  }
}
