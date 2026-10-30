import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import {
  AUTH_GRPC_LOADER_OPTIONS,
  AUTH_GRPC_PACKAGES,
  AUTH_GRPC_PROTO_PATHS,
} from '@ross2p/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Auth');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<KafkaOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [configService.get<string>('KAFKA_BROKER')!],
        clientId: 'auth-client',
      },
      consumer: {
        groupId: 'auth-consumer',
        allowAutoTopicCreation: true,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  app.connectMicroservice<GrpcOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: AUTH_GRPC_PACKAGES,
        protoPath: AUTH_GRPC_PROTO_PATHS,
        loader: AUTH_GRPC_LOADER_OPTIONS,
        url: configService.getOrThrow<string>('AUTH_GRPC_URL'),
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  await app.init();
  logger.log('🚀 gRPC microservice started');
}

void bootstrap();
