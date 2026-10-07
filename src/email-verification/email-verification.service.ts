import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import type { EmailVerificationType } from '@ross2p/types';
import {
  EventClientService,
  NotificationMessage,
  Services,
} from '@ross2p/common';
import { EmailVerificationRepository } from './email-verification.repository';
import { AuthService } from '../auth/auth.service';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { SessionService } from '../session/session.service';
import { UserClient } from '../user-client/user-client.service';
import { toAuthUserView } from '../user-client/user-grpc-response.mapper';

@Injectable()
export class EmailVerificationService implements OnModuleInit {
  constructor(
    private readonly userClient: UserClient,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: EventClientService,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    this.notificationClient.subscribeToResponseOf(
      NotificationMessage.SEND_MAIL_CONFIRMATION,
    );
    await this.notificationClient.connect();
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  async sendCode(args: { sessionId: string }): Promise<EmailVerificationType> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );
    const user = toAuthUserView(
      await this.userClient.findUserById(session.userId),
    );

    if (user.emailVerifiedAt != null) {
      throw new ConflictException('Email is already verified');
    }

    const { code, ...emailVerification } =
      await this.emailVerificationRepository.createEmailVerificationCode({
        userId: user.id,
        code: this.generateCode(),
      });
    await this.notificationClient.sendAndReturnPromise(
      NotificationMessage.SEND_MAIL_CONFIRMATION,
      {
        userId: user.id,
        code,
      },
    );
    return emailVerification;
  }

  async checkCode(args: {
    id: string;
    userId: string;
    sessionId: string;
    email: string;
    code: string;
  }): Promise<TokenPayloadDto> {
    const user = toAuthUserView(
      await this.userClient.findUserById(args.userId),
    );

    if (user.emailVerifiedAt != null) {
      throw new ConflictException('Email is already verified');
    }

    const stored =
      await this.emailVerificationRepository.findEmailVerificationCodeByUserId(
        args.userId,
      );
    if (!stored || stored.id !== args.id || stored.code !== args.code.trim()) {
      throw new BadRequestException(
        'Code is invalid or expired — request a new one',
      );
    }

    await this.emailVerificationRepository.deleteEmailVerificationCode(
      args.userId,
    );
    await this.userClient.markEmailVerified({
      userId: args.userId,
      email: args.email,
    });

    return this.authService.refreshAccessTokenBySessionId(args.sessionId);
  }
}
