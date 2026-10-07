import { ChangePasswordDto } from './change-password.dto';

export class ChangePasswordMessageDto extends ChangePasswordDto {
  userId!: string;

  sessionId!: string;
}
