import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { SessionRepository } from './session.repository';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { last } from 'rxjs';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  createSession(createSessionDto: CreateSessionDto) {
    createSessionDto.lastUsedAt = new Date();
    return this.sessionRepository.createSession(createSessionDto);
  }

  async findSessionsPageByUserId(pageRequestSessionDto: PageRequestSessionDto) {
    const [sessions, total] = await Promise.all([
      this.sessionRepository.findSessionsByUserId(pageRequestSessionDto),
      this.sessionRepository.countSessionsByUserId(pageRequestSessionDto),
    ]);
    return pageRequestSessionDto.toPageResponse(sessions, total);
  }

  findSessionById(sessionId: string) {
    return this.sessionRepository.findSessionById(sessionId);
  }

  updateSession(sessionId: string, updateSessionDto: UpdateSessionDto) {
    updateSessionDto.lastUsedAt = new Date();
    return this.sessionRepository.updateSession(sessionId, updateSessionDto);
  }

  deleteSession(sessionId: string) {
    return this.sessionRepository.deleteSession(sessionId);
  }

  updateLastUsedAt(sessionId: string) {
    return this.updateSession(sessionId, {});
  }
}
