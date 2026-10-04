import { Controller, UseFilters } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthSessionProto,
  DataPayload,
  GrpcErrorFilter,
  GrpcGlobalFilter,
  GrpcHttpExceptionFilter,
} from '@ross2p/common';
import { ListSessionsMessageDto } from './dto/list-sessions-message.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { SessionIdentityDto } from './dto/session-identity.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { SessionService } from './session.service';
import { toSessionPage } from './session.grpc-mapper';

@Controller()
@AuthSessionProto.SessionServiceControllerMethods()
export class SessionController
  implements AuthSessionProto.SessionServiceController
{
  constructor(private readonly sessionService: SessionService) {}

  @MessagePattern(AuthMessage.SESSION_LIST)
  listSessionsKafka(@DataPayload() data: ListSessionsMessageDto) {
    const dto = Object.assign(new PageRequestSessionDto(), {
      userId: data.userId,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 200,
    });
    return this.sessionService.findSessionsPageByUserId(dto);
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT)
  signOutSessionKafka(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'sign-out');
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT_ALL)
  signOutAllSessionsKafka(@DataPayload() data: UserIdMessageDto) {
    return this.sessionService.signOutAll(data.userId);
  }

  @MessagePattern(AuthMessage.SESSION_REVOKE)
  revokeSessionKafka(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'revoked');
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async listSessions(
    data: AuthSessionProto.ListSessionsRequest,
  ): Promise<AuthSessionProto.SessionPage> {
    const dto = Object.assign(new PageRequestSessionDto(), {
      userId: data.userId,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 200,
    });
    const page = await this.sessionService.findSessionsPageByUserId(dto);
    return toSessionPage(page);
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async signOutSession(
    data: AuthCommonProto.SessionIdentityRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOut(data.userId, data.sessionId, 'sign-out');
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async signOutAllSessions(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOutAll(data.userId);
    return {};
  }

  @UseFilters(GrpcHttpExceptionFilter, GrpcErrorFilter, GrpcGlobalFilter)
  async revokeSession(
    data: AuthCommonProto.SessionIdentityRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOut(data.userId, data.sessionId, 'revoked');
    return {};
  }
}
