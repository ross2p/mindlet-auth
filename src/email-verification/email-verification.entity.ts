import type { EmailVerificationType } from '@ross2p/types';

export class EmailVerificationEntity implements EmailVerificationType {
  id: string;
  userId: string;
  code: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
