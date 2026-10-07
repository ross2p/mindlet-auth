import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserPasswordProto } from '@ross2p/common';
import { firstValueFrom } from 'rxjs';
import { USER_GRPC_TRANSPORT } from './user-grpc.token';

@Injectable()
export class UserPasswordGrpcClient implements OnModuleInit {
  private service!: UserPasswordProto.UserPasswordServiceClient;

  constructor(
    @Inject(USER_GRPC_TRANSPORT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service =
      this.client.getService<UserPasswordProto.UserPasswordServiceClient>(
        'UserPasswordService',
      );
  }

  verifyPassword(req: UserPasswordProto.VerifyPasswordRequest) {
    return firstValueFrom(this.service.verifyPassword(req));
  }
}
