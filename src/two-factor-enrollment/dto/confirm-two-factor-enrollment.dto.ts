import type { ConfirmTwoFactorEnrollmentType } from '@ross2p/types';

export class ConfirmTwoFactorEnrollmentDto implements ConfirmTwoFactorEnrollmentType {
  code!: string;
}
