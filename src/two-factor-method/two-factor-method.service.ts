import { NotificationGrpcClient } from '../notification-client/notification-grpc.client';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthEvent,
  EventClientService,
  Services,
  NotificationCoreProto,
} from '@ross2p/common';
import type { EnableSecondFactorMethodResultType } from '@ross2p/types';
import type { SecondFactorMethodType } from '.prisma/client-auth';
import { TwoFactorEnrollmentService } from '../two-factor-enrollment/two-factor-enrollment.service';
import { TwoFactorMethodRepository } from './two-factor-method.repository';
import { BackupCodeService } from '../backup-code/backup-code.service';
import { ReauthService } from '../reauth/reauth.service';
import { TwoFactorMethodEntity } from './two-factor-method.entity';

const SUPPORTED_METHODS: SecondFactorMethodType[] = ['EMAIL_CODE'];

@Injectable()
export class TwoFactorMethodService {
  constructor(
    private readonly enrollmentService: TwoFactorEnrollmentService,
    private readonly methodRepository: TwoFactorMethodRepository,
    private readonly backupCodeService: BackupCodeService,
    private readonly reauthService: ReauthService,
    @Inject(Services.USER) private readonly userClient: EventClientService,
    private readonly notificationClient: NotificationGrpcClient,
  ) {}

  private assertSupported(type: SecondFactorMethodType): void {
    if (!SUPPORTED_METHODS.includes(type)) {
      throw new BadRequestException(
        `This second factor method is not yet supported: ${type}`,
      );
    }
  }

  public listMethods(userId: string): Promise<TwoFactorMethodEntity[]> {
    return this.methodRepository.findActiveByUserId(userId);
  }

  public async beginEnable(
    userId: string,
    type: SecondFactorMethodType,
  ): Promise<void> {
    this.assertSupported(type);
    const code = await this.enrollmentService.createChallenge(userId);
    await this.notificationClient.sendTwoFactor({
      userId,
      code,
      provider: NotificationCoreProto.Provider.EMAIL,
    });
  }

  /** First-ever active method issues Backup codes exactly once (AC-18). */
  public async confirmEnable(
    userId: string,
    type: SecondFactorMethodType,
    code: string,
  ): Promise<EnableSecondFactorMethodResultType> {
    this.assertSupported(type);

    await this.enrollmentService.verifyChallenge(userId, code);

    const activeBefore = await this.methodRepository.findActiveByUserId(userId);
    await this.methodRepository.setEnabled(userId, type, true);

    if (activeBefore.length > 0) {
      return {};
    }

    const backupCodes = await this.backupCodeService.issueCodes(userId);
    this.userClient.emitEvent(AuthEvent.ACCOUNT_TWO_FACTOR_ENABLED, {
      userId,
    });

    return { backupCodes };
  }

  /**
   * Disabling the last active method requires Re-authentication (AC-19);
   * disabling one of several active methods does not (AC-30).
   */
  public async disable(
    userId: string,
    type: SecondFactorMethodType,
  ): Promise<void> {
    const active = await this.methodRepository.findActiveByUserId(userId);
    const isLastMethod = active.length === 1 && active[0].type === type;

    if (isLastMethod) {
      const verified = await this.reauthService.isVerified(userId);
      if (!verified) {
        throw new UnauthorizedException(
          'Re-authentication is required to disable your last second factor method',
        );
      }
    }

    await this.methodRepository.setEnabled(userId, type, false);

    if (isLastMethod) {
      this.userClient.emitEvent(AuthEvent.ACCOUNT_TWO_FACTOR_DISABLED, {
        userId,
      });
    }
  }

  /** Invalidates the previous set and issues a new one exactly once (AC-31). */
  public async regenerateBackupCodes(
    userId: string,
  ): Promise<EnableSecondFactorMethodResultType> {
    const verified = await this.reauthService.isVerified(userId);
    if (!verified) {
      throw new UnauthorizedException(
        'Re-authentication is required to regenerate Backup codes',
      );
    }

    const backupCodes = await this.backupCodeService.issueCodes(userId);
    return { backupCodes };
  }

  /**
   * A valid unused Backup code satisfies Re-authentication and is then
   * single-use (AC-32).
   */
  public async consumeBackupCodeForReauth(
    userId: string,
    code: string,
  ): Promise<void> {
    const consumed = await this.backupCodeService.consume(userId, code);
    if (consumed) {
      await this.reauthService.markVerified(userId);
      return;
    }
    throw new BadRequestException(
      'This backup code is invalid or already used',
    );
  }
}
