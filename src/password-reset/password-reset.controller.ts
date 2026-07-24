import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { Throttle } from '@nestjs/throttler';
import {
  AuthGuard,
  AuthenticatedUser,
  IsPublic,
  ResponseMessage,
  UserDetails,
  ValidationPipe,
} from '@ross2p/common';
import { forgotPasswordSchema, resetPasswordSchema } from '@ross2p/types';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { changePasswordSchema } from './schemas/change-password.schema';
import { FORGOT_PASSWORD_RATE_LIMIT } from '../auth-challenge.constants';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Password')
@Controller()
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Post('forgot-password')
  @IsPublic()
  @ResponseMessage('If an account exists, a reset email will be sent')
  @Throttle({
    default: {
      limit: FORGOT_PASSWORD_RATE_LIMIT.limit,
      ttl: FORGOT_PASSWORD_RATE_LIMIT.ttlMs,
    },
  })
  @ApiOperation({ summary: 'Request password reset (anti-enumeration)' })
  forgotPassword(
    @Body(new ValidationPipe(forgotPasswordSchema)) body: ForgotPasswordDto,
  ): Promise<void> {
    return this.passwordResetService.forgotPassword(body);
  }

  @Post('reset-password')
  @IsPublic()
  @ResponseMessage('Password reset successful')
  @Throttle({
    default: {
      limit: FORGOT_PASSWORD_RATE_LIMIT.limit,
      ttl: FORGOT_PASSWORD_RATE_LIMIT.ttlMs,
    },
  })
  @ApiOperation({ summary: 'Complete password reset and revoke all sessions' })
  resetPassword(
    @Body(new ValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
  ): Promise<void> {
    return this.passwordResetService.resetPassword(body);
  }

  @Post('change-password/request-2fa')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('Two-factor code sent')
  @ApiOperation({
    summary: 'Send step-up 2FA code before change-password',
  })
  requestChangePassword2fa(
    @UserDetails() user: AuthenticatedUser,
  ): Promise<void> {
    return this.passwordResetService.requestChangePassword2fa(user.sessionId);
  }

  @Post('change-password')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ResponseMessage('Password changed successfully')
  @ApiOperation({
    summary: 'Change password and revoke all sessions',
  })
  changePassword(
    @UserDetails() user: AuthenticatedUser,
    @Body(new ValidationPipe(changePasswordSchema)) body: ChangePasswordDto,
  ): Promise<void> {
    return this.passwordResetService.changePasswordFromDto(
      user.id,
      user.sessionId,
      body,
    );
  }
}
