import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { EventClientService, Services, UserMessage } from '@ross2p/common';
import { CacheService } from '../cache/cache.service';
import { REAUTH_TTL_SECONDS } from './reauth.constants';

/**
 * Marks a User as recently re-authenticated (AC-14/16/18/19/23). The
 * password path lives here; a Backup code path is added once BackupCode
 * exists (T20/T21) but shares this same marker via `markVerified`.
 */
@Injectable()
export class ReauthService implements OnModuleInit {
  constructor(
    private readonly cache: CacheService,
    @Inject(Services.USER) private readonly userService: EventClientService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserMessage.VERIFY_PASSWORD);
    await this.userService.connect();
  }

  public async verifyPassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    const isValid = await this.userService
      .sendAndReturnPromise<boolean>(UserMessage.VERIFY_PASSWORD, {
        userId,
        password,
      })
      .catch((): boolean => false);

    if (isValid) {
      await this.markVerified(userId);
    }
    return isValid;
  }

  public async markVerified(userId: string): Promise<void> {
    await this.cache.set(userId, true, REAUTH_TTL_SECONDS);
  }

  public async isVerified(userId: string): Promise<boolean> {
    const marker = await this.cache.get<boolean>(userId);
    return marker === true;
  }
}
