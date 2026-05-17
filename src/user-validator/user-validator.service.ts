import { UserPayload } from '@ross2p/types';
import {
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthenticatedUser,
  ClientService,
  Services,
  UserQuery,
} from '@ross2p/common';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '../session/session.service';
import { UserTokenService } from '../token/user-token/user-token.service';
import type { AuthUserView } from '../auth/dto/auth-user.view';

@Injectable()
export class UserValidatorService implements OnModuleInit {
  constructor(
    private readonly userTokenService: UserTokenService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    await this.userService.connect();
  }

  getPayloadFromAccessToken(accessToken: string): UserPayload {
    return this.userTokenService.validateAccessToken(accessToken);
  }

  async validateUserByToken(
    token: string,
  ): Promise<AuthenticatedUser & { sessionId: string }> {
    const userPayload = this.getPayloadFromAccessToken(token);

    const activeSession = await this.sessionService.findActiveSessionById(
      userPayload.sessionId,
    );
    if (!activeSession) {
      throw new UnauthorizedException(
        'Your session is no longer active or has expired. Please sign in again to continue.',
      );
    }
    if (activeSession.userId !== userPayload.id) {
      throw new UnauthorizedException(
        'The access token does not match the user linked to this session. Please sign in again.',
      );
    }

    const user = await firstValueFrom(
      this.userService.send<AuthUserView, { userId: string }>(
        UserQuery.GET_BY_ID,
        { userId: userPayload.id },
      ),
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      sessionId: userPayload.sessionId,
    };
  }
}
