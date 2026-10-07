import type { CreateUserType } from '@ross2p/types';

export class CreateUserDto implements CreateUserType {
  email!: string;

  firstName!: string;

  lastName!: string;

  password!: string;

  avatarUrl?: string | null;

  phoneNumber?: string | null;
}
