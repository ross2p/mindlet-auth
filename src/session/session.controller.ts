import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SessionService } from './session.service';
import {
  AuthGuard,
  AuthenticatedUser,
  ResponseMessage,
  UserDetails,
  ValidationPipe,
} from '@ross2p/common';
import { pageRequestSessionQuerySchema } from '@ross2p/types';
import { PageRequestQueryDto } from './dto/page-request-query.dto';
import { PageRequestSessionDto } from './dto/page-request-session.dto';
import { PageResponseSessionDto } from './dto/page-response-session.dto';

@ApiTags('Sessions')
@Controller('session')
@UseGuards(AuthGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('sign-out')
  @HttpCode(204)
  @ResponseMessage('Signed out successfully')
  async signOut(@UserDetails() user: AuthenticatedUser): Promise<void> {
    await this.sessionService.signOut(user.id, user.sessionId, 'sign-out');
  }

  @Post('sign-out-all')
  @HttpCode(204)
  @ResponseMessage('Signed out of all sessions')
  async signOutAll(@UserDetails() user: AuthenticatedUser): Promise<void> {
    await this.sessionService.signOutAll(user.id);
  }

  @Get()
  @ResponseMessage('Sessions retrieved')
  @ApiOperation({ summary: 'List active sessions for the signed-in user' })
  @ApiResponse({ status: 200, type: PageResponseSessionDto })
  async listSessions(
    @UserDetails() user: AuthenticatedUser,
    @Query(new ValidationPipe(pageRequestSessionQuerySchema))
    query: PageRequestQueryDto,
  ): Promise<PageResponseSessionDto> {
    const dto = Object.assign(new PageRequestSessionDto(), query, {
      userId: user.id,
    });
    return this.sessionService.findSessionsPageByUserId(dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ResponseMessage('Session revoked')
  async deleteSession(
    @UserDetails() user: AuthenticatedUser,
    @Param('id') sessionId: string,
  ): Promise<void> {
    await this.sessionService.signOut(user.id, sessionId, 'revoked');
  }
}
