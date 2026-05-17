import { AuthUserDto } from '@ross2p/types';
import type { AuthUserView } from '../auth/dto/auth-user.view';

export function mapAuthUserViewToAuthUserDto(user: AuthUserView): AuthUserDto {
  return user;
}
