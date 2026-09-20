import type { SecondFactorMethod } from '.prisma/client-auth';

export class TwoFactorMethodEntity implements SecondFactorMethod {
  id: string;
  userId: string;
  type: SecondFactorMethod['type'];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
