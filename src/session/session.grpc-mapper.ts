import { AuthSessionProto } from '@ross2p/common';
import { SessionDto } from './dto/session.dto';
import { PageResponseSessionDto } from './dto/page-response-session.dto';

function toSessionMessage(
  session: SessionDto,
): AuthSessionProto.SessionMessage {
  return {
    id: session.id,
    userId: session.userId,
    refreshTokenHash: session.refreshTokenHash ?? undefined,
    provider: session.provider,
    userAgent: session.userAgent ?? undefined,
    ipAddress: session.ipAddress ?? undefined,
    deviceLabel: session.deviceLabel ?? undefined,
    timezone: session.timezone ?? undefined,
    refreshAt: session.refreshAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    lastUsedAt: session.lastUsedAt.toISOString(),
    revokedAt: session.revokedAt?.toISOString() ?? undefined,
    revokedReason: session.revokedReason ?? undefined,
    createdAt: session.createdAt.toISOString(),
    twoFactorVerifiedAt:
      session.twoFactorVerifiedAt?.toISOString() ?? undefined,
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
