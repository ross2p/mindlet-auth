import { Module } from '@nestjs/common';
import { TwoFactorMethodRepository } from './two-factor-method.repository';

@Module({
  providers: [TwoFactorMethodRepository],
  exports: [TwoFactorMethodRepository],
})
export class TwoFactorMethodModule {}
