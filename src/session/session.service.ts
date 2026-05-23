import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { checkExists } from '@ross2p/common';
import { AuthEvent, ClientService, Services } from '@ross2p/common';
import { SessionRepository } from './session.repository';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { BulkUpdateSessionsDto } from './dto/bulk-update-sessions.dto';
import { sha256Hex } from '../utils/sha256.util';
import { SessionEntity } from './session.entity';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepository: SessionRepository,
    @Inject(Services.USER) private readonly userEventClient: ClientService,
  ) {}

  createSession(createSessionDto: CreateSessionDto) {
    const lastUsedAt = createSessionDto.lastUsedAt ?? new Date();
    return this.sessionRepository.createSession({
      ...createSessionDto,
      lastUsedAt,
    });
  }

  async findSessionsPageByUserId(pageRequestSessionDto: PageRequestSessionDto) {
    const [sessions, total] = await Promise.all([
      this.sessionRepository.findActiveSessionsByUserId(pageRequestSessionDto),
      this.sessionRepository.countActiveSessionsByUserId(pageRequestSessionDto),
    ]);
    return pageRequestSessionDto.toPageResponse(sessions, total);
  }

  async findActiveSessionById(
    sessionId: string,
  ): Promise<SessionEntity | null> {
    return this.sessionRepository.findActiveSessionById(sessionId);
  }

  async findActiveSessionByIdOrThrow(
    sessionId: string,
  ): Promise<SessionEntity> {
    return checkExists(this.findActiveSessionById(sessionId));
  }

  async verifyRefreshTokenHash(
    userId: string,
    sessionId: string,
    refreshToken: string,
  ): Promise<void> {
    const session = await this.findActiveSessionByIdOrThrow(sessionId);
    if (session.userId !== userId) {
      throw new UnauthorizedException(
        'The refresh token session does not belong to the signed-in user. Please sign in again.',
      );
    }
    if (session.refreshTokenHash == null) {
      throw new UnauthorizedException(
        'This session does not have a refresh token registered yet. Please sign in again.',
      );
    }
    const expected = sha256Hex(refreshToken);
    if (session.refreshTokenHash !== expected) {
      await this.bulkUpdateSessions(session.userId, {
        revokedAt: new Date(),
        revokedReason: 'refresh-token-reuse-detected',
      });
      throw new UnauthorizedException(
        'The provided refresh token does not match this session. Your account may have been compromised; all active sessions have been signed out. Please sign in again with your password.',
      );
    }
  }

  private async updateSession(
    sessionId: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<SessionEntity> {
    await checkExists(
      this.sessionRepository.findSessionById(sessionId),
      'Session not found',
    );
    return this.sessionRepository.updateSession(sessionId, updateSessionDto);
  }

  async updateTwoFactorVerifiedAt(
    sessionId: string,
    twoFactorVerifiedAt: Date,
  ): Promise<SessionEntity> {
    return this.updateSession(sessionId, { twoFactorVerifiedAt });
  }

  updateLastUsedAt(sessionId: string) {
    return this.updateSession(sessionId, { lastUsedAt: new Date() });
  }

  async revokeSession(
    sessionId: string,
    reason: string,
  ): Promise<SessionEntity> {
    return this.updateSession(sessionId, {
      revokedAt: new Date(),
      revokedReason: reason,
    });
  }

  async signOut(
    userId: string,
    sessionId: string,
    eventReason: 'sign-out' | 'revoked' = 'sign-out',
  ): Promise<void> {
    const session = await checkExists(
      this.sessionRepository.findSessionById(sessionId),
      'Session not found',
    );
    if (session.userId !== userId) {
      throw new ForbiddenException(
        'This session does not belong to your account. You cannot sign it out.',
      );
    }
    if (!session.revokedAt) {
      await this.revokeSession(sessionId, eventReason);
      this.userEventClient.emitEvent(AuthEvent.SESSION_ENDED, {
        userId,
        sessionId,
        reason: eventReason,
        at: new Date().toISOString(),
      });
    }
  }

  async signOutAll(userId: string): Promise<void> {
    await this.bulkUpdateSessions(userId, {
      revokedAt: new Date(),
      revokedReason: 'sign-out-all',
    });
    this.userEventClient.emitEvent(AuthEvent.SESSION_ENDED, {
      userId,
      sessionId: 'all',
      reason: 'sign-out-all',
      at: new Date().toISOString(),
    });
  }

  async bulkUpdateSessions(
    userId: string,
    patch: BulkUpdateSessionsDto,
  ): Promise<number> {
    return this.sessionRepository.bulkUpdateSessionsByUserId(userId, patch);
  }
}
