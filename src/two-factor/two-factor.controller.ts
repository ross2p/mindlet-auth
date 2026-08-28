import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Get('methods')
  @UseGuards(AuthGuard)
  @ResponseMessage('2FA methods')
  @ApiOperation({
    summary: 'List 2FA methods for the current login challenge',
  })
  @ApiResponse({ status: 200, description: 'Methods for picker' })
  @ApiResponse({ status: 409, description: '2FA challenge not pending' })
  listMethods(@UserDetails() user: AuthenticatedUser) {
    return this.twoFactorService.listTwoFactorMethods({
      userId: user.id,
      sessionId: user.sessionId,
    });
  }

  @Post('resend-code')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  @ResponseMessage('Two-factor code sent')
  @ApiOperation({
    summary: 'Resend login two-factor email code',
  })
  @ApiResponse({ status: 204, description: 'Code dispatched' })
  resendCode(@UserDetails() user: AuthenticatedUser): Promise<void> {
    return this.twoFactorService.sendCode({ sessionId: user.sessionId });
  }

  @Post('verify')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 900_000 } })
  @ResponseMessage('2FA verified')
  @ApiOperation({
    summary: 'Verify login two-factor with email code',
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
