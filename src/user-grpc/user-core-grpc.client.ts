import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserCommonProto, UserCoreProto } from '@ross2p/common';
import { firstValueFrom } from 'rxjs';
import { USER_GRPC_TRANSPORT } from './user-grpc.token';

@Injectable()
export class UserCoreGrpcClient implements OnModuleInit {
  private service!: UserCoreProto.UserCoreServiceClient;

  constructor(
    @Inject(USER_GRPC_TRANSPORT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service =
      this.client.getService<UserCoreProto.UserCoreServiceClient>(
        'UserCoreService',
      );
  }

  findUserByEmail(req: UserCoreProto.GetByEmailRequest) {
    return firstValueFrom(this.service.findUserByEmail(req));
  }

  findUserById(req: UserCommonProto.UserIdRequest) {
    return firstValueFrom(this.service.findUserById(req));
  }

  createUser(req: UserCoreProto.CreateRequest) {
    return firstValueFrom(this.service.createUser(req));
  }

  markEmailVerified(req: UserCoreProto.MarkEmailVerifiedRequest) {
    return firstValueFrom(this.service.markEmailVerified(req));
  }

  setTwoFactorEnabled(req: UserCoreProto.SetTwoFactorEnabledRequest) {
    return firstValueFrom(this.service.setTwoFactorEnabled(req));
  }
}
