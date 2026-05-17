import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientService,
  Services,
  UserMessage,
  UserQuery,
} from '@ross2p/common';
import { TokenPayloadDto } from '@ross2p/types';
import { EmailVerificationRepository } from './email-verification.repository';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class EmailVerificationService implements OnModuleInit {
  constructor(
    @Inject(Services.USER) private readonly userService: ClientService,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserMessage.EMAIL_MARK_VERIFIED);
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    await this.userService.connect();
  }

  sendCode(args: { sessionId?: string; userId?: string }): Promise<void> {
    void args;
    // TODO: persist code + dispatch notification email
    return Promise.resolve();
  }

  async checkCode(args: {
    userId: string;
    sessionId: string;
    email: string;
    code: string;
  }): Promise<TokenPayloadDto> {
    const stored =
      await this.emailVerificationRepository.findEmailVerificationCodeByUserId(
        args.userId,
      );
    if (!stored || stored.code !== args.code.trim()) {
      throw new BadRequestException('Invalid code');
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
