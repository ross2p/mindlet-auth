import { UserEntity } from '@ross2p/types';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Services, ClientService, TokenCommand } from '@ross2p/common';
import { UserPayload, AccessTokenDto } from '@ross2p/types';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserValidatorService implements OnModuleInit {
  constructor(
    @Inject(Services.TOKEN)
    private readonly tokenService: ClientService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
  ) {}

  async onModuleInit() {
    this.tokenService.subscribeToResponseOf(TokenCommand.VALIDATE);
    this.userService.subscribeToResponseOf('user.findUserById');
    await this.tokenService.connect();
    await this.userService.connect();
  }

  async validateUserByToken(token: string): Promise<UserEntity> {
    const userPayload: UserPayload = await firstValueFrom(
      this.tokenService.send<UserPayload, AccessTokenDto>(
        TokenCommand.VALIDATE,
        { accessToken: token },
      ),
    );

    const user = await firstValueFrom(
      this.userService.send<UserEntity, { userId: string }>(
        'user.findUserById',
        { userId: userPayload.id },
      ),
    );
    return user;
  }
}
