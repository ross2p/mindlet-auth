import { PageRequest } from '@ross2p/types';
import { SessionEntity } from '../session.entity';

export class PageRequestSessionDto extends PageRequest<SessionEntity> {
  userId: string;

  buildWhereFilter(): Record<string, unknown> {
    return {
      userId: this.userId,
    };
  }
}
