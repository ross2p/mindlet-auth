import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { ClientService, Services, UserQuery } from '@ross2p/common';
import { TwoFactorRepository } from './two-factor.repository';
import { AuthService } from '../auth/auth.service';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { SessionService } from '../session/session.service';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { isTwoFactorAttemptsExceeded } from '../auth-challenge.constants';

@Injectable()
export class TwoFactorService implements OnModuleInit {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(Services.USER) private readonly userService: ClientService,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: ClientService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    this.notificationClient.subscribeToResponseOf(
      'notification.send-two-factor',
    );
    await this.userService.connect();
    await this.notificationClient.connect();
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private async loadUser(userId: string): Promise<AuthUserView> {
    return this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId });
  }

  private async createTwoFactorCode(sessionId: string): Promise<void> {
    const code = this.generateCode();
    await this.twoFactorRepository.createTwoFactorCode({
      sessionId: sessionId,
      code,
    });
    //todo: send code to user via email, sms, etc.
  }

  async sendCode(args: { sessionId: string }): Promise<void> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );

    if (session.twoFactorVerifiedAt != null) {
      throw new BadRequestException(
        'Two-factor authentication is already verified for this session.',
      );
    }

    const user = await this.loadUser(session.userId);
    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }
    await this.createTwoFactorCode(args.sessionId);
  }

  /** Step-up code for privileged actions (e.g. change-password) after unlock. */
  async sendStepUpCode(args: { sessionId: string }): Promise<void> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );
    const user = await this.loadUser(session.userId);
    if (!user.twoFactorEnabled) {
      throw new BadRequestException('Two-factor authentication is not enabled');
    }
    await this.createTwoFactorCode(args.sessionId);
  }

  /**
   * Validates and consumes a Redis 2FA code for the session (step-up / login).
   * Does not mutate Session.twoFactorVerifiedAt.
   */
  async verifyChallengeCode(args: {
    sessionId: string;
    code: string;
  }): Promise<void> {
    const twoFactorCode =
      await this.twoFactorRepository.findTwoFactorCodeBySessionId(
        args.sessionId,
      );
    if (!twoFactorCode) {
      throw new UnauthorizedException(
        'This two-factor code is invalid or has expired. Request a new code.',
      );
    }
    if (isTwoFactorAttemptsExceeded(twoFactorCode.attempts)) {
      await this.twoFactorRepository.deleteTwoFactorCode(args.sessionId);
      throw new UnauthorizedException(
        'Too many incorrect two-factor codes. Please start sign-in again.',
      );
    }

    if (twoFactorCode.code !== args.code.trim()) {
      await this.twoFactorRepository.updateTwoFactorCode({
        sessionId: args.sessionId,
        attempts: twoFactorCode.attempts + 1,
      });
      throw new UnauthorizedException('The two-factor code is incorrect.');
    }

    await this.twoFactorRepository.deleteTwoFactorCode(args.sessionId);
  }

  async checkCode(args: {
    userId: string;
    sessionId: string;
    code: string;
  }): Promise<TokenPayloadDto> {
    await this.verifyChallengeCode({
      sessionId: args.sessionId,
      code: args.code,
    });
    const verifiedAt = new Date();
    await this.sessionService.updateTwoFactorVerifiedAt(
      args.sessionId,
      verifiedAt,
    );

    return this.authService.refreshAccessTokenBySessionId(args.sessionId);
  }
}
