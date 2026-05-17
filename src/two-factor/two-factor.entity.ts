export class TwoFactorEntity {
  sessionId: string;
  code: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
