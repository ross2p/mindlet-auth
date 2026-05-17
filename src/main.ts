import { NestExpressApplication } from '@nestjs/platform-express';
import { MicroServiceApplicationConfig } from '@ross2p/common';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app =
    await MicroServiceApplicationConfig.create<NestExpressApplication>(
      AppModule,
    );

  app.application.use(cookieParser());
  app.init();
  await app.start();
}
void bootstrap();
