import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomInt } from 'crypto';
import * as argon2 from 'argon2';
import {
  AuthEvent,
  ClientService,
  NotificationMessage,
  Services,
} from '@ross2p/common';
import type { EnableSecondFactorMethodResultType } from '@ross2p/types';
import type { SecondFactorMethodType } from '.prisma/client-auth';
import { TwoFactorEnrollmentRepository } from '../two-factor-enrollment/two-factor-enrollment.repository';
import { TwoFactorMethodRepository } from './two-factor-method.repository';
import { BackupCodeRepository } from '../backup-code/backup-code.repository';
import { ReauthService } from '../reauth/reauth.service';
import { TwoFactorMethodEntity } from './two-factor-method.entity';

const SUPPORTED_METHODS: SecondFactorMethodType[] = ['EMAIL_CODE'];
const BACKUP_CODE_COUNT = 10;

@Injectable()
export class TwoFactorMethodService {
  constructor(
    private readonly enrollmentRepository: TwoFactorEnrollmentRepository,
    private readonly methodRepository: TwoFactorMethodRepository,
    private readonly backupCodeRepository: BackupCodeRepository,
    private readonly reauthService: ReauthService,
    @Inject(Services.USER) private readonly userClient: ClientService,
    @Inject(Services.NOTIFICATION)
    private readonly notificationClient: ClientService,
  ) {}

  private assertSupported(type: SecondFactorMethodType): void {
    if (!SUPPORTED_METHODS.includes(type)) {
      throw new BadRequestException(
        `This second factor method is not yet supported: ${type}`,
      );
    }
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: BACKUP_CODE_COUNT }, () =>
      randomBytes(5).toString('hex').toUpperCase(),
    );
  }

  public listMethods(userId: string): Promise<TwoFactorMethodEntity[]> {
    return this.methodRepository.findActiveByUserId(userId);
  }

  public async beginEnable(
    userId: string,
    type: SecondFactorMethodType,
  ): Promise<void> {
    this.assertSupported(type);
    const code = this.generateCode();
    await this.enrollmentRepository.createEnrollmentChallenge(userId, code);
    await this.notificationClient.sendAndReturnPromise(
      NotificationMessage.SEND_TWO_FACTOR,
      { userId, code, provider: 'EMAIL' },
    );
  }

  /** First-ever active method issues Backup codes exactly once (AC-18). */
  public async confirmEnable(
    userId: string,
    type: SecondFactorMethodType,
    code: string,
  ): Promise<EnableSecondFactorMethodResultType> {
    this.assertSupported(type);

    const challenge = await this.enrollmentRepository.findByUserId(userId);
    if (!challenge) {
      throw new UnauthorizedException(
        'This confirmation code is invalid or has expired',
      );
    }
    if (challenge.attempts >= 5) {
      await this.enrollmentRepository.deleteByUserId(userId);
      throw new UnauthorizedException(
        'Too many incorrect codes; start enabling this method again',
      );
    }
    if (challenge.code !== code.trim()) {
      await this.enrollmentRepository.updateEnrollmentChallenge({
        userId,
        attempts: challenge.attempts + 1,
      });
      throw new UnauthorizedException('The confirmation code is incorrect');
    }
    await this.enrollmentRepository.deleteByUserId(userId);

    const activeBefore = await this.methodRepository.findActiveByUserId(userId);
    await this.methodRepository.setEnabled(userId, type, true);

    if (activeBefore.length > 0) {
      return {};
    }

    const backupCodes = this.generateBackupCodes();
    const hashes = await Promise.all(
      backupCodes.map((plain) => argon2.hash(plain)),
    );
    await this.backupCodeRepository.replaceAllForUser(userId, hashes);
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

    const backupCodes = this.generateBackupCodes();
    const hashes = await Promise.all(
      backupCodes.map((plain) => argon2.hash(plain)),
    );
    await this.backupCodeRepository.replaceAllForUser(userId, hashes);
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
    const unused = await this.backupCodeRepository.findUnusedByUserId(userId);
    for (const candidate of unused) {
      if (await argon2.verify(candidate.codeHash, code.trim())) {
        await this.backupCodeRepository.markUsed(candidate.id);
        await this.reauthService.markVerified(userId);
        return;
      }
    }
    throw new BadRequestException(
      'This backup code is invalid or already used',
    );
  }
}
