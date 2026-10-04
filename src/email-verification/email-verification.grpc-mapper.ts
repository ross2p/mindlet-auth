import { AuthEmailVerificationProto } from '@ross2p/common';
import type { EmailVerificationType } from '@ross2p/types';

export function toEmailVerificationMessage(
  dto: EmailVerificationType,
): AuthEmailVerificationProto.EmailVerification {
  return {
    id: dto.id,
    userId: dto.userId,
    attempts: dto.attempts,
    createdAt: dto.createdAt.toISOString(),
    updatedAt: dto.updatedAt.toISOString(),
  };
}
