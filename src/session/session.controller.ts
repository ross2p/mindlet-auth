import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthMessage, DataPayload } from '@ross2p/common';
import { ListSessionsMessageDto } from './dto/list-sessions-message.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { SessionIdentityDto } from './dto/session-identity.dto';
import { UserIdMessageDto } from './dto/user-id-message.dto';
import { SessionService } from './session.service';

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @MessagePattern(AuthMessage.SESSION_LIST)
  listSessions(@DataPayload() data: ListSessionsMessageDto) {
    const dto = Object.assign(new PageRequestSessionDto(), {
      userId: data.userId,
      pageNumber: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 200,
    });
    return this.sessionService.findSessionsPageByUserId(dto);
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT)
  signOutSession(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'sign-out');
  }

  @MessagePattern(AuthMessage.SESSION_SIGN_OUT_ALL)
  signOutAllSessions(@DataPayload() data: UserIdMessageDto) {
    return this.sessionService.signOutAll(data.userId);
  }

  @MessagePattern(AuthMessage.SESSION_REVOKE)
  revokeSession(@DataPayload() data: SessionIdentityDto) {
    return this.sessionService.signOut(data.userId, data.sessionId, 'revoked');
  }
}
