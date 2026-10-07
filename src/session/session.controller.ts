import { Controller } from '@nestjs/common';
import { GrpcMethod, MessagePattern } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthMessage,
  AuthSessionProto,
  DataPayload,
} from '@ross2p/common';
import { ListSessionsMessageDto } from './dto/list-sessions-message.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { SessionIdentityDto } from './dto/session-identity.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { SessionService } from './session.service';

@Controller()
export class SessionController
  implements AuthSessionProto.SessionServiceController
{
  constructor(private readonly sessionService: SessionService) {}

  @MessagePattern(AuthMessage.SESSION_LIST)
  listSessionsEvent(@DataPayload() data: ListSessionsMessageDto) {
    const dto = Object.assign(new PageRequestSessionDto(), {
      userId: data.userId,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 200,
    });
    return this.sessionService.findSessionsPageByUserId(dto);
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT)
  signOutSessionEvent(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'sign-out');
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT_ALL)
  signOutAllSessionsEvent(@DataPayload() data: UserIdMessageDto) {
    return this.sessionService.signOutAll(data.userId);
  }

  @MessagePattern(AuthMessage.SESSION_REVOKE)
  revokeSessionEvent(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'revoked');
  }

  @GrpcMethod('SessionService', 'listSessions')
  async listSessions(
    data: AuthSessionProto.ListSessionsRequest,
  ): Promise<AuthSessionProto.SessionPage> {
    const dto = Object.assign(new PageRequestSessionDto(), {
      userId: data.userId,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 200,
    });
    const page = await this.sessionService.findSessionsPageByUserId(dto);
    return {
      ...page,
      data: page.data.map((session) => ({
        ...session,
        provider: session.provider as AuthSessionProto.SessionProvider,
      })),
    };
  }

  @GrpcMethod('SessionService', 'signOutSession')
  async signOutSession(
    data: AuthCommonProto.SessionIdentityRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOut(data.userId, data.sessionId, 'sign-out');
    return {};
  }

  @GrpcMethod('SessionService', 'signOutAllSessions')
  async signOutAllSessions(
    data: AuthCommonProto.UserIdRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOutAll(data.userId);
    return {};
  }

  @GrpcMethod('SessionService', 'revokeSession')
  async revokeSession(
    data: AuthCommonProto.SessionIdentityRequest,
  ): Promise<AuthCommonProto.Empty> {
    await this.sessionService.signOut(data.userId, data.sessionId, 'revoked');
    return {};
  }
}
