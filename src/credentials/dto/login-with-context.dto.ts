import type { LoginType } from '@ross2p/types';
import { LoginDto } from './login.dto';

export class LoginWithContext extends LoginDto implements LoginType {
  ipAddress: string | null = null;

  userAgent: string | null = null;
}
