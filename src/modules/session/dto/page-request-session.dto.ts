import { Prisma } from '@ross2p/database';
import { PageRequest, SessionEntity } from '@ross2p/types';

export class PageRequestSessionDto extends PageRequest<SessionEntity> {
  userId: string;

  buildWhereFilter(): Prisma.SessionWhereInput {
    return {
      userId: this.userId,
    };
  }
}
