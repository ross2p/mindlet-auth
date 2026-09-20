import { Module } from '@nestjs/common';
import { BackupCodeRepository } from './backup-code.repository';

@Module({
  providers: [BackupCodeRepository],
  exports: [BackupCodeRepository],
})
export class BackupCodeModule {}
