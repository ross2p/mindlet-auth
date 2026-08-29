import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import {
  ClientService,
  NotificationMessage,
  Services,
  UserMessage,
  UserQuery,
} from '@ross2p/common';
import type { AuthUserView } from '../auth/dto/auth-user.view';
import { TwoFactorEnrollmentRepository } from './two-factor-enrollment.repository';

@Injectable()
export class TwoFactorEnrollmentService implements OnModuleInit {
  constructor(
    private readonly enrollmentRepository: TwoFactorEnrollmentRepository,
    @Inject(Services.USER) private readonly userService: ClientService,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: ClientService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserQuery.GET_BY_ID);
    this.userService.subscribeToResponseOf(UserMessage.VERIFY_PASSWORD);
    this.userService.subscribeToResponseOf(UserMessage.SET_TWO_FACTOR_ENABLED);
    this.notificationClient.subscribeToResponseOf(
      NotificationMessage.SEND_TWO_FACTOR,
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

  async beginEnable(userId: string): Promise<void> {
    const user = await this.loadUser(userId);
    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled for this account.',
      );
    }
    const code = this.generateCode();
    await this.enrollmentRepository.createEnrollmentChallenge(userId, code);
    await this.notificationClient.sendAndReturnPromise(
      NotificationMessage.SEND_TWO_FACTOR,
      {
        userId,
        code,
        provider: 'EMAIL',
      },
    );
  }

  async confirmEnable(userId: string, code: string): Promise<void> {
    const user = await this.loadUser(userId);
    if (user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is already enabled for this account.',
      );
    }

    const challenge = await this.enrollmentRepository.findByUserId(userId);
    if (!challenge) {
      throw new UnauthorizedException(
        'This confirmation code is invalid or has expired. Request a new code.',
      );
    }
    if (challenge.attempts >= 5) {
      await this.enrollmentRepository.deleteByUserId(userId);
      throw new UnauthorizedException(
        'Too many incorrect codes. Please start enabling two-factor again.',
      );
    }

    if (challenge.code !== code.trim()) {
      await this.enrollmentRepository.updateEnrollmentChallenge({
        userId,
        attempts: challenge.attempts + 1,
      });
      throw new UnauthorizedException('The confirmation code is incorrect.');
    }

    await this.enrollmentRepository.deleteByUserId(userId);
    await this.userService.sendAndReturnPromise(
      UserMessage.SET_TWO_FACTOR_ENABLED,
      {
        userId,
        enabled: true,
      },
    );
  }

  async disable(userId: string, password: string): Promise<void> {
    const user = await this.loadUser(userId);
    if (!user.twoFactorEnabled) {
      throw new BadRequestException(
        'Two-factor authentication is not enabled for this account.',
      );
    }

    const ok = await this.userService
      .sendAndReturnPromise<boolean>(UserMessage.VERIFY_PASSWORD, {
        userId,
        password,
      })
      .catch((): boolean => false);

    if (!ok) {
      throw new BadRequestException('Invalid password');
    }

    await this.userService.sendAndReturnPromise(
      UserMessage.SET_TWO_FACTOR_ENABLED,
      {
        userId,
        enabled: false,
      },
    );
    await this.enrollmentRepository.deleteByUserId(userId);
  }
}
