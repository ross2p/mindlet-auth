import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  ClientService,
  Services,
  UserPrivateMessage,
  UserQuery,
} from '@ross2p/common';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetTokenService } from '../token/password-reset-token/password-reset-token.service';

@Injectable()
export class PasswordResetService implements OnModuleInit {
  constructor(
    private readonly passwordResetTokenService: PasswordResetTokenService,
    @Inject(Services.USER) private readonly userService: ClientService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_EMAIL);
    this.userService.subscribeToResponseOf(UserPrivateMessage.UPDATE);
    await this.userService.connect();
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    await this.passwordResetTokenService.create(dto.email);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const { email } = await this.passwordResetTokenService.consume(dto.token);

    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { email: string }
    >(UserQuery.GET_BY_EMAIL, { email });

    await this.userService.sendAndReturnPromise(UserPrivateMessage.UPDATE, {
      userId: user.id,
      password: dto.newPassword,
    });
  }
}
