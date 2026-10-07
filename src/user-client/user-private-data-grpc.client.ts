import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { UserPrivateDataProto } from '@ross2p/common';
import { firstValueFrom } from 'rxjs';
import { USER_GRPC_TRANSPORT } from './user-grpc.token';

@Injectable()
export class UserPrivateDataGrpcClient implements OnModuleInit {
  private service!: UserPrivateDataProto.UserPrivateDataServiceClient;

  constructor(
    @Inject(USER_GRPC_TRANSPORT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service =
      this.client.getService<UserPrivateDataProto.UserPrivateDataServiceClient>(
        'UserPrivateDataService',
      );
  }

  updateUserPrivateData(req: UserPrivateDataProto.UpdateRequest) {
    return firstValueFrom(this.service.updateUserPrivateData(req));
  }
}
