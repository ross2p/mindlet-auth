import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import type { Session } from '.prisma/client-auth';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { UpdateSessionRecordDto } from './dto/update-session-record.dto';
import { BulkUpdateSessionsDto } from './dto/bulk-update-sessions.dto';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionRepository {
  constructor(private readonly db: DatabaseService) {}

  public async createSession(data: CreateSessionDto): Promise<Session> {
    return this.db.session.create({ data });
  }

  public async updateSession(
    sessionId: string,
    data: UpdateSessionRecordDto,
  ): Promise<Session> {
    return this.db.session.update({
      where: { id: sessionId },
      data,
    });
  }

  public async findSessionById(sessionId: string): Promise<Session | null> {
    return this.db.session.findUnique({ where: { id: sessionId } });
  }

  public async findActiveSessionById(
    sessionId: string,
  ): Promise<Session | null> {
    const now = new Date();
    return this.db.session.findFirst({
      where: {
        id: sessionId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
  }

  public async findActiveSessionsByUserId(
    pageRequestSessionDto: PageRequestSessionDto,
  ): Promise<Session[]> {
    const now = new Date();
    return this.db.session.findMany({
      where: {
        userId: pageRequestSessionDto.userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      orderBy: { lastUsedAt: 'desc' },
      skip: pageRequestSessionDto.skip,
      take: pageRequestSessionDto.take,
    });
  }

  public async countActiveSessionsByUserId(
    pageRequestSessionDto: PageRequestSessionDto,
  ): Promise<number> {
    const now = new Date();
    return this.db.session.count({
      where: {
        userId: pageRequestSessionDto.userId,
        revokedAt: null,
        expiresAt: { gt: now },
      },
    });
  }

  public async bulkUpdateSessionsByUserId(
    userId: string,
    data: BulkUpdateSessionsDto,
  ): Promise<number> {
    const res = await this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data,
    });
    return res.count;
  }
}
