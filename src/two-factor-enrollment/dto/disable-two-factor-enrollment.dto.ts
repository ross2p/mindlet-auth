import type { DisableTwoFactorEnrollmentType } from '@ross2p/types';

export class DisableTwoFactorEnrollmentDto implements DisableTwoFactorEnrollmentType {
  password!: string;
}
