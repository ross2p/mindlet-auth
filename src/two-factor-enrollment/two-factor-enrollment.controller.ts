import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthGuard,
  AuthenticatedUser,
  ResponseMessage,
  UserDetails,
  ValidationPipe,
} from '@ross2p/common';
import { Throttle } from '@nestjs/throttler';
import { TwoFactorEnrollmentService } from './two-factor-enrollment.service';
import { ConfirmTwoFactorEnrollmentDto } from './dto/confirm-two-factor-enrollment.dto';
import { DisableTwoFactorEnrollmentDto } from './dto/disable-two-factor-enrollment.dto';
import { confirmTwoFactorEnrollmentSchema } from './schemas/confirm-two-factor-enrollment.schema';
import { disableTwoFactorEnrollmentSchema } from './schemas/disable-two-factor-enrollment.schema';

@ApiTags('Two-factor authentication')
@ApiBearerAuth()
@Controller('2fa')
@UseGuards(AuthGuard)
export class TwoFactorEnrollmentController {
  constructor(
    private readonly twoFactorEnrollmentService: TwoFactorEnrollmentService,
  ) {}

  @Post('enable')
  @HttpCode(204)
  @Throttle({ default: { limit: 3, ttl: 900_000 } })
  @ResponseMessage('Two-factor enrollment code sent')
  @ApiOperation({
    summary: 'Start enabling two-factor authentication',
    description:
      'Sends a 6-digit code to the account email. Call POST /auth/2fa/confirm with the code to finish.',
  })
  @ApiResponse({ status: 204, description: 'Code sent (if applicable)' })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enable(@UserDetails() user: AuthenticatedUser): Promise<void> {
    await this.twoFactorEnrollmentService.beginEnable(user.id);
  }

  @Post('confirm')
  @HttpCode(204)
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @ResponseMessage('Two-factor authentication enabled')
  @ApiOperation({
    summary: 'Confirm enabling two-factor with email code',
  })
  @ApiResponse({ status: 204, description: '2FA enabled' })
  @ApiResponse({ status: 400, description: '2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Invalid or expired code' })
  async confirm(
    @UserDetails() user: AuthenticatedUser,
    @Body(new ValidationPipe(confirmTwoFactorEnrollmentSchema))
    body: ConfirmTwoFactorEnrollmentDto,
  ): Promise<void> {
    await this.twoFactorEnrollmentService.confirmEnable(user.id, body.code);
  }

  @Post('disable')
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ResponseMessage('Two-factor authentication disabled')
  @ApiOperation({
    summary: 'Disable two-factor authentication',
    description: 'Requires the current account password.',
  })
  @ApiResponse({ status: 204, description: '2FA disabled' })
  @ApiResponse({
    status: 400,
    description: 'Invalid password or 2FA not enabled',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async disable(
    @UserDetails() user: AuthenticatedUser,
    @Body(new ValidationPipe(disableTwoFactorEnrollmentSchema))
    body: DisableTwoFactorEnrollmentDto,
  ): Promise<void> {
    await this.twoFactorEnrollmentService.disable(user.id, body.password);
  }
}
