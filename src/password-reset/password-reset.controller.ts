import { Body, Controller, Post } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { Throttle } from '@nestjs/throttler';
import { IsPublic, ResponseMessage, ValidationPipe } from '@ross2p/common';
import { forgotPasswordSchema, resetPasswordSchema } from '@ross2p/types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller()
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  @IsPublic()
  @ResponseMessage('If an account exists, a reset email will be sent')
  @Throttle({ default: { limit: 3, ttl: 900_000 } })
  forgotPassword(
    @Body(new ValidationPipe(forgotPasswordSchema)) body: ForgotPasswordDto,
  ): Promise<void> {
    return this.passwordResetService.forgotPassword(body);
  }

  @Post('reset-password')
  @IsPublic()
  @ResponseMessage('Password reset successful')
  @Throttle({ default: { limit: 3, ttl: 900_000 } })
  resetPassword(
    @Body(new ValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
  ): Promise<void> {
    return this.passwordResetService.resetPassword(body);
  }
}
