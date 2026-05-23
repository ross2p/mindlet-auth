import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';
import {
  AuthGuard,
  AuthenticatedUser,
  ResponseMessage,
  UserDetails,
  ValidationPipe,
} from '@ross2p/common';
import { verifyTwoFactorCodeSchema } from '@ross2p/types';
import { Throttle } from '@nestjs/throttler';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { VerifyTwoFactorCodeDto } from './dto/verify-two-factor-code.dto';

@ApiTags('Two-factor authentication')
@ApiBearerAuth()
@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('resend-code')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ResponseMessage('Two-factor code sent')
  @ApiOperation({
    summary: 'Resend login two-factor email code',
    description:
      'Requires a valid access token (e.g. short-lived token after password login).',
  })
  @ApiResponse({ status: 200, description: 'Email dispatched' })
  resendCode(@UserDetails() user: AuthenticatedUser): Promise<void> {
    return this.twoFactorService.sendCode({ sessionId: user.sessionId });
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @ResponseMessage('2FA verified')
  @ApiOperation({
    summary: 'Verify login two-factor with email code',
    description:
      'Returns a new access token payload (same shape as POST /auth/refresh).',
  })
  @ApiResponse({
    status: 200,
    description: 'New access JWT issued',
    type: TokenPayloadDto,
  })
  verify(
    @UserDetails() user: AuthenticatedUser,
    @Body(new ValidationPipe(verifyTwoFactorCodeSchema))
    body: VerifyTwoFactorCodeDto,
  ): Promise<TokenPayloadDto> {
    return this.twoFactorService.checkCode({
      userId: user.id,
      sessionId: user.sessionId,
      code: body.code,
    });
  }
}
