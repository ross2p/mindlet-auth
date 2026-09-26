import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { GrpcOptions, KafkaOptions, Transport } from '@nestjs/microservices';
import { RPC_PROTO_PACKAGE, RPC_PROTO_PATH } from '@ross2p/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Auth');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Fire-and-forget events only (e.g. `user.deleted`) — synchronous RPC moved to gRPC below.
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

  // Synchronous request/reply RPC (auth guard validation, login, sessions, ...).
  // Replaces the equivalent Kafka `sendAndReturnPromise` round-trip: bounded
  // deadline on the client side (see GrpcClientService) instead of an
  // unbounded wait on a reply topic.
  app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      package: RPC_PROTO_PACKAGE,
      protoPath: RPC_PROTO_PATH,
      url: configService.get<string>('AUTH_GRPC_URL') ?? '0.0.0.0:50051',
    },
  });

  await app.startAllMicroservices();

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on port ${port}`);
}

void bootstrap();
