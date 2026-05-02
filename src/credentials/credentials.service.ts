import { UserEntity } from '@ross2p/types';
import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {
  ClientService,
  Services,
  UserCommand,
  UserEvent,
  UserQuery,
} from '@ross2p/common';
import { CreateUserDto, LoginDto, UserTokensDto } from '@ross2p/types';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class CredentialsService implements OnModuleInit {
  constructor(
    @Inject(Services.USER)
    private readonly userService: ClientService,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    this.userService.subscribeToResponseOf(UserCommand.CREATE);
    this.userService.subscribeToResponseOf('user.get_by_email');
    this.userService.subscribeToResponseOf('user.password.verify');
    await this.userService.connect();
  }
  async emailLogin(loginDto: LoginDto): Promise<UserTokensDto> {
    const user = await this.userService.sendAndReturnPromise<UserEntity>(
      UserQuery.GET_BY_EMAIL,
      { email: loginDto.email },
    );

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const passwordValid = await this.userService.sendAndReturnPromise<{
      isPasswordValid: boolean;
    }>('user.password.verify', {
      userId: user.id,
      password: loginDto.password,
    });

    if (!passwordValid.isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return this.authService.generateTokensByUserEntity(user);
  }

  async emailRegister(registerDto: CreateUserDto): Promise<UserTokensDto> {
    const user = await this.userService.sendAndReturnPromise<
      UserEntity,
      CreateUserDto
    >(UserCommand.CREATE, registerDto);
    return this.authService.generateTokensByUserEntity(user);
  }
}
