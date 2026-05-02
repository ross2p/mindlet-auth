import { DatabaseService, Prisma, SessionEntity } from '@ross2p/database';
import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';

@Injectable()
export class SessionRepository {
  private readonly sessionRepository: Prisma.SessionDelegate;

  constructor(databaseService: DatabaseService) {
    this.sessionRepository = databaseService.client.session as Prisma.SessionDelegate;
  }

  public async createSession(data: CreateSessionDto) {
    return this.sessionRepository.create({ data });
  }

  public async updateSession(sessionId: string, data: UpdateSessionDto) {
    return this.sessionRepository.update({
      where: { id: sessionId },
      data,
    });
  }

  public async deleteSession(sessionId: string) {
    return this.sessionRepository.delete({
      where: { id: sessionId },
    });
  }

  public async findSessionById(sessionId: string) {
    return this.sessionRepository.findUnique({
      where: { id: sessionId },
    });
  }

  public async findByRefreshToken(refreshToken: string) {
    return this.sessionRepository.findFirst({
      where: { refreshToken },
    });
  }

  public async findSessionsByUserId(
    pageRequestSessionDto: PageRequestSessionDto,
  ) {
    return this.sessionRepository.findMany({
      where: pageRequestSessionDto.buildWhereFilter(),
      skip: pageRequestSessionDto.skip,
      take: pageRequestSessionDto.take,
    });
  }

  public async countSessionsByUserId(
    pageRequestSessionDto: PageRequestSessionDto,
  ) {
    return this.sessionRepository.count({
      where: pageRequestSessionDto.buildWhereFilter(),
    });
  }
}
