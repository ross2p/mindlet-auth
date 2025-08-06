import { AuthModule } from './auth.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import {
  createClientConfig,
  MicroServiceApplicationConfig,
  Services,
} from '@ross2p/messages';

async function bootstrap() {
  const app =
    await MicroServiceApplicationConfig.create<NestExpressApplication>(
      AuthModule,
    );

  app.init(Services.AUTH);
  await app.start();
}
void bootstrap();
