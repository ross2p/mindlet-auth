import { NotificationGrpcClient } from '../notification-client/notification-grpc.client';
import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { randomInt } from 'crypto';
import { NotificationCoreProto } from '../../generated/protos';
import type { VerifyTwoFactorCodeType } from '@ross2p/types';
import type { TokenPayloadDto } from '../token/types/token.types';
import { TwoFactorRepository } from './two-factor.repository';
import { AuthService } from '../auth/auth.service';
import { SessionService } from '../session/session.service';
import type { AuthUserView } from '../auth/types/auth-user.view';
import { UserClient } from '../user-client/user-client.service';
import { toAuthUserView } from '../user-client/user-grpc-response.mapper';
import { isTwoFactorAttemptsExceeded } from '../auth-challenge.constants';
import {
  TwoFactorAlreadyVerified,
  TwoFactorAttemptsExceeded,
  TwoFactorChallengeNotPending,
  TwoFactorCodeExpired,
  TwoFactorCodeIncorrect,
  TwoFactorMethodUnavailable,
  TwoFactorNotEnabled,
} from '../auth.exceptions';
import { buildTwoFactorChallenge } from './two-factor-methods.util';

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly twoFactorRepository: TwoFactorRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly userClient: UserClient,
    private readonly notificationClient: NotificationGrpcClient,
    private readonly sessionService: SessionService,
  ) {}

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private async loadUser(userId: string): Promise<AuthUserView> {
    return toAuthUserView(await this.userClient.findUserById(userId));
  }

  private async createTwoFactorCode(
    sessionId: string,
    user: AuthUserView,
  ): Promise<void> {
    const code = this.generateCode();
    await this.twoFactorRepository.createTwoFactorCode({
      sessionId: sessionId,
      code,
    });
    await this.notificationClient.sendTwoFactor({
      userId: user.id,
      code,
      provider: NotificationCoreProto.Provider.EMAIL,
    });
  }

  async sendCode(args: { sessionId: string }): Promise<void> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );

    if (session.twoFactorVerifiedAt != null) {
      throw new TwoFactorAlreadyVerified();
    }

    const user = await this.loadUser(session.userId);
    if (!user.twoFactorEnabled) {
      throw new TwoFactorNotEnabled();
    }
    await this.createTwoFactorCode(args.sessionId, user);
  }

  /** Step-up code for privileged actions (e.g. change-password) after unlock. */
  async sendStepUpCode(args: { sessionId: string }): Promise<void> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );
    const user = await this.loadUser(session.userId);
    if (!user.twoFactorEnabled) {
      throw new TwoFactorNotEnabled();
    }
    await this.createTwoFactorCode(args.sessionId, user);
  }

  /**
   * Validates and consumes a Redis 2FA code for the session (step-up / login).
   * Does not mutate Session.twoFactorVerifiedAt.
   */
  async verifyChallengeCode(args: {
    sessionId: string;
    userId: string;
    code: string;
    method?: VerifyTwoFactorCodeType['method'];
  }): Promise<void> {
    if (args.method) {
      const user = await this.loadUser(args.userId);
      const challenge = buildTwoFactorChallenge({
        twoFactorEnabled: user.twoFactorEnabled,
      });
      const selected = challenge?.methods.find((m) => m.id === args.method);
      if (!selected?.available) {
        throw new TwoFactorMethodUnavailable();
      }
    }

    const failed = await this.twoFactorRepository.getUserFailedAttempts(
      args.userId,
    );
    if (isTwoFactorAttemptsExceeded(failed)) {
      throw new TwoFactorAttemptsExceeded();
    }

    const twoFactorCode =
      await this.twoFactorRepository.findTwoFactorCodeBySessionId(
        args.sessionId,
      );
    if (!twoFactorCode) {
      throw new TwoFactorCodeExpired();
    }

    if (twoFactorCode.code !== args.code.trim()) {
      const next = await this.twoFactorRepository.incrementUserFailedAttempts(
        args.userId,
      );
      if (isTwoFactorAttemptsExceeded(next)) {
        throw new TwoFactorAttemptsExceeded();
      }
      throw new TwoFactorCodeIncorrect();
    }

    await this.twoFactorRepository.deleteTwoFactorCode(args.sessionId);
  }

  async checkCode(args: {
    userId: string;
    sessionId: string;
    code: string;
    method?: VerifyTwoFactorCodeType['method'];
  }): Promise<TokenPayloadDto> {
    await this.verifyChallengeCode({
      sessionId: args.sessionId,
      userId: args.userId,
      code: args.code,
      method: args.method,
    });
    const verifiedAt = new Date();
    await this.sessionService.updateTwoFactorVerifiedAt(
      args.sessionId,
      verifiedAt,
    );

    return this.authService.refreshAccessTokenBySessionId(args.sessionId);
  }

  async listTwoFactorMethods(args: { userId: string; sessionId: string }) {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );
    const fullUser = await this.loadUser(args.userId);
    const challenge = buildTwoFactorChallenge({
      twoFactorEnabled: fullUser.twoFactorEnabled,
    });
    if (!challenge || session.twoFactorVerifiedAt != null) {
      throw new TwoFactorChallengeNotPending();
    }
    return { methods: challenge.methods };
  }
}
