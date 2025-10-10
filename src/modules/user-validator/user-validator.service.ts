import { UserEntity } from '@ross2p/types';
import { Inject, Injectable } from '@nestjs/common';
import { Services, ClientService } from '@ross2p/common';
import { UserPayload } from '@ross2p/types';
import { AccessTokenDto } from '@ross2p/types';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';

@Injectable()
export class UserValidatorService {
  constructor(
    @Inject(Services.TOKEN)
    private readonly tokenService: ClientService,
    @Inject(Services.USER)
    private readonly userService: ClientService,
  ) {}

  async validateUserByToken(token: string): Promise<UserEntity> {
    const userPayload: UserPayload = await firstValueFrom(
      this.tokenService.send<UserPayload, AccessTokenDto>('token.validate', {
        accessToken: token,
      }),
    );

    const user = await this.userService.firstValueFrom<
      UserEntity,
      { userId: string }
    >('user.getById', {
      userId: userPayload.id,
    });
    return user;
  }
}
