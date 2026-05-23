import type { Session } from '.prisma/client-auth';
import { SessionDto } from './dto/session.dto';

/**
 * Active session row shape used across the auth service layer.
 * Mirrors Prisma `Session` — keep fields aligned with `prisma/schema.prisma`.
 */
export class SessionEntity extends SessionDto implements Session {}
