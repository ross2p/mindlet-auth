import { Controller } from '@nestjs/common';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';
import {
  AuthCommonProto,
  AuthSessionProto,
  DataPayload,
  UserEvent,
} from '@ross2p/common';
import { AccountDeletionEventDto } from './types/account-deletion-event.dto';
import { PageRequestSessionDto } from './types/page-request-session.dto';
import { SessionService } from './session.service';

@Controller()
export class SessionController
  implements AuthSessionProto.SessionServiceController
{
  constructor(private readonly sessionService: SessionService) {}

  /**
   * Revokes every session for a deleted account (AC-23). The user service
   * triggers the wider deletion cascade by emitting `user.deleted`; this is
   * auth's own reaction to that same event.
   */
  @EventPattern(UserEvent.DELETED)
  public onUserDeleted(@DataPayload() data: AccountDeletionEventDto) {
    return this.sessionService.signOutAll(data.userId, 'account-deleted');
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
