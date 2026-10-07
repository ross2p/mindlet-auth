import type { AuthUserType } from '@ross2p/types';
import type { AuthUserView } from '../auth/types/auth-user.view';

export function mapAuthUserViewToAuthUserDto(user: AuthUserView): AuthUserType {
  return user;
}
