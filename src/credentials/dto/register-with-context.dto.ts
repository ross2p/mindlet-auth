import type { CreateUserType } from '@ross2p/types';
import { CreateUserDto } from './create-user.dto';

export class RegisterWithContext
  extends CreateUserDto
  implements CreateUserType
{
  ipAddress: string | null = null;

  userAgent: string | null = null;
}
