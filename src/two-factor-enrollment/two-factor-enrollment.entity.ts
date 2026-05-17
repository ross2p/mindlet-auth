export class TwoFactorEnrollmentEntity {
  userId: string;
  code: string;
  attempts: number;
  createdAt: Date;
  updatedAt: Date;
}
