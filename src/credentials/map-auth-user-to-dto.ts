import type { AuthUserView } from '../auth/dto/auth-user.view';
import { AuthUserDto } from './dto/auth-user.dto';

export function mapAuthUserViewToAuthUserDto(user: AuthUserView): AuthUserDto {
  return user;
}
