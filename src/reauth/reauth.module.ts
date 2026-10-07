import { Module } from '@nestjs/common';
import { CacheModule } from '../cache/cache.module';
import { ReauthService } from './reauth.service';
import { ReauthController } from './reauth.controller';
import { REAUTH_TTL_SECONDS } from './reauth.constants';
import { UserGrpcClientModule } from '../user-grpc/user-grpc-client.module';

@Module({
  imports: [
    UserGrpcClientModule,
    CacheModule.forFeature({
      prefix: 'auth:reauth',
      defaultTtlSeconds: REAUTH_TTL_SECONDS,
    }),
  ],
  controllers: [ReauthController],
  providers: [ReauthService],
  exports: [ReauthService],
})
export class ReauthModule {}
