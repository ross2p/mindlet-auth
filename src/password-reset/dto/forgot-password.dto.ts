import type { ForgotPasswordType } from '@ross2p/types';

export class ForgotPasswordDto implements ForgotPasswordType {
  email!: string;
}
