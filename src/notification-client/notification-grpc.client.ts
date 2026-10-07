import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { NotificationCoreProto } from '@ross2p/common';
import { firstValueFrom } from 'rxjs';
import { NOTIFICATION_GRPC_TRANSPORT } from './notification-grpc.token';

@Injectable()
export class NotificationGrpcClient implements OnModuleInit {
  private service!: NotificationCoreProto.NotificationServiceClient;

  constructor(
    @Inject(NOTIFICATION_GRPC_TRANSPORT) private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.service =
      this.client.getService<NotificationCoreProto.NotificationServiceClient>(
        'NotificationService',
      );
  }

  sendMailConfirmation(req: NotificationCoreProto.SendMailConfirmationRequest) {
    return firstValueFrom(this.service.sendMailConfirmation(req));
  }

  sendTwoFactor(req: NotificationCoreProto.SendTwoFactorRequest) {
    return firstValueFrom(this.service.sendTwoFactor(req));
  }

  sendPasswordReset(req: NotificationCoreProto.SendPasswordResetRequest) {
    return firstValueFrom(this.service.sendPasswordReset(req));
  }
}
