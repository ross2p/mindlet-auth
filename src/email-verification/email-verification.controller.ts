import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import {
  AuthGuard,
  AuthenticatedUser,
  ResponseMessage,
  UserDetails,
  ValidationPipe,
} from '@ross2p/common';
import { verifyEmailCodeSchema } from '@ross2p/types';
import { Throttle } from '@nestjs/throttler';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { VerifyEmailCodeDto } from './dto/verify-email-code.dto';

@Controller('verify-email')
@UseGuards(AuthGuard)
@ApiTags('Email verification')
@ApiBearerAuth()
export class EmailVerificationController {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Post('resend-code')
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ResponseMessage('Verification code sent')
  @ApiOperation({
    summary: 'Resend email verification code',
    description:
      'Requires a valid access token (e.g. short-lived token after registration).',
  })
  @ApiResponse({ status: 200, description: 'Email dispatched' })
  resendCode(@UserDetails() user: AuthenticatedUser): Promise<void> {
    return this.emailVerificationService.sendCode({ userId: user.id });
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @ResponseMessage('Email verified successfully')
  @ApiOperation({
    summary: 'Verify email with 6-digit code',
    description:
      'Returns a new access token payload (same shape as POST /auth/refresh).',
  })
  @ApiResponse({
    status: 200,
    description: 'New access JWT issued after email is marked verified',
    type: TokenPayloadDto,
  })
  verify(
    @UserDetails() user: AuthenticatedUser,
    @Body(new ValidationPipe(verifyEmailCodeSchema)) body: VerifyEmailCodeDto,
  ): Promise<TokenPayloadDto> {
    return this.emailVerificationService.checkCode({
      userId: user.id,
      sessionId: user.sessionId,
      email: user.email,
      code: body.code,
    });
  }
}
