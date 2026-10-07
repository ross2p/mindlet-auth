import type { LoginType } from '@ross2p/types';

export class LoginDto implements LoginType {
  email!: string;

  password!: string;
}
