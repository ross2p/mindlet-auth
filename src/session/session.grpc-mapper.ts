import { AuthSessionProto } from '@ross2p/common';
import { SessionDto } from './dto/session.dto';
import { PageResponseSessionDto } from './dto/page-response-session.dto';

function toSessionMessage(
  session: SessionDto,
): AuthSessionProto.SessionMessage {
  return {
    id: session.id,
    userId: session.userId,
    refreshTokenHash: session.refreshTokenHash,
    provider: session.provider,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    deviceLabel: session.deviceLabel,
    timezone: session.timezone,
    refreshAt: session.refreshAt,
    expiresAt: session.expiresAt,
    lastUsedAt: session.lastUsedAt,
    revokedAt: session.revokedAt,
    revokedReason: session.revokedReason,
    createdAt: session.createdAt,
    twoFactorVerifiedAt: session.twoFactorVerifiedAt,
  };
}

export function toSessionPage(
  page: PageResponseSessionDto,
): AuthSessionProto.SessionPage {
  return {
    data: page.data.map(toSessionMessage),
    totalCount: page.totalCount,
    pageNumber: page.pageNumber,
    pageSize: page.pageSize,
    pageCount: page.pageCount,
  };
}
