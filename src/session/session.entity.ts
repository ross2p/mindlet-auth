import type { Session } from '.prisma/client-auth';

/**
 * Active session row shape used across the auth service layer.
 * Mirrors Prisma `Session` — keep fields aligned with `prisma/schema.prisma`.
 */
export type SessionEntity = Session;
