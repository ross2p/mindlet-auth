import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { DataPayload, UserEvent } from '@ross2p/common';
import { SessionService } from '../session/session.service';
import { AccountDeletionEventDto } from './dto/account-deletion-event.dto';

/**
 * Revokes every session for a deleted account (AC-23). The user service
 * triggers the wider deletion cascade by emitting `user.deleted`; this is
 * auth's own reaction to that same event.
 */
@Controller()
export class AccountDeletionSyncController {
  constructor(private readonly sessionService: SessionService) {}

  @EventPattern(UserEvent.DELETED)
  public onUserDeleted(@DataPayload() data: AccountDeletionEventDto) {
    return this.sessionService.signOutAll(data.userId, 'account-deleted');
  }
}
