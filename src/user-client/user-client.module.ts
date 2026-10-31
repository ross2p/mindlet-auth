import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  GrpcClientService,
  USER_GRPC_LOADER_OPTIONS,
  USER_GRPC_PACKAGES,
  USER_GRPC_PROTO_PATHS,
} from '@ross2p/common';
import { USER_GRPC_TRANSPORT } from './user-grpc.constants';
import { UserCoreGrpcClient } from './user-core-grpc.client';
import { UserPasswordGrpcClient } from './user-password-grpc.client';
import { UserPrivateDataGrpcClient } from './user-private-data-grpc.client';
import { UserService } from './user-client.service';
import { UserGrpcResponseMapper } from './user-grpc-response.mapper';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: USER_GRPC_TRANSPORT,
      useFactory: (config: ConfigService) =>
        new GrpcClientService({
          package: USER_GRPC_PACKAGES,
          protoPath: USER_GRPC_PROTO_PATHS,
          loader: USER_GRPC_LOADER_OPTIONS,
          url: config.getOrThrow<string>('USER_GRPC_URL'),
        }),
      inject: [ConfigService],
    },
    UserCoreGrpcClient,
    UserPasswordGrpcClient,
    UserPrivateDataGrpcClient,
    UserGrpcResponseMapper,
    UserService,
  ],
  exports: [UserService],
})
export class UserClientModule {}
