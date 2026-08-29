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
  ClientService,
  NotificationMessage,
  Services,
  UserMessage,
  UserQuery,
} from '@ross2p/common';
import { EmailVerificationRepository } from './email-verification.repository';
import { AuthService } from '../auth/auth.service';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';
import { SessionService } from '../session/session.service';
import type { AuthUserView } from '../auth/dto/auth-user.view';

@Injectable()
export class EmailVerificationService implements OnModuleInit {
  constructor(
    @Inject(Services.USER) private readonly userService: ClientService,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: ClientService,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserMessage.EMAIL_MARK_VERIFIED);
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    this.notificationClient.subscribeToResponseOf(
      NotificationMessage.SEND_MAIL_CONFIRMATION,
    );
    await this.userService.connect();
    await this.notificationClient.connect();
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  async sendCode(args: { sessionId: string }): Promise<EmailVerificationType> {
    const session = await this.sessionService.findActiveSessionByIdOrThrow(
      args.sessionId,
    );
    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId: session.userId });

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
    const user = await this.userService.sendAndReturnPromise<
      AuthUserView,
      { userId: string }
    >(UserQuery.GET_BY_ID, { userId: args.userId });

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
    await this.userService.sendAndReturnPromise(
      UserMessage.EMAIL_MARK_VERIFIED,
      { userId: args.userId, email: args.email },
    );

    return this.authService.refreshAccessTokenBySessionId(args.sessionId);
  }
}
