import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  NOTIFICATION_GRPC_LOADER_OPTIONS,
  NOTIFICATION_GRPC_PACKAGES,
  NOTIFICATION_GRPC_PROTO_PATHS,
  GrpcClientService,
} from '@ross2p/common';
import { NOTIFICATION_GRPC_TRANSPORT } from './notification-grpc.token';
import { NotificationGrpcClient } from './notification-grpc.client';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: NOTIFICATION_GRPC_TRANSPORT,
      useFactory: (config: ConfigService) =>
        new GrpcClientService({
          package: NOTIFICATION_GRPC_PACKAGES,
          protoPath: NOTIFICATION_GRPC_PROTO_PATHS,
          loader: NOTIFICATION_GRPC_LOADER_OPTIONS,
          url: config.getOrThrow<string>('NOTIFICATION_GRPC_URL'),
        }),
      inject: [ConfigService],
    },
    NotificationGrpcClient,
  ],
  exports: [NotificationGrpcClient],
})
export class NotificationClientModule {}
