import type { BackupCode } from '.prisma/client-auth';

export class BackupCodeEntity implements BackupCode {
  id: string;
  userId: string;
  codeHash: string;
  usedAt: Date | null;
  createdAt: Date;
}
