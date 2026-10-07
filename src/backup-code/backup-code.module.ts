import { Module } from '@nestjs/common';
import { BackupCodeRepository } from './backup-code.repository';
import { BackupCodeService } from './backup-code.service';

@Module({
  providers: [BackupCodeRepository, BackupCodeService],
  exports: [BackupCodeService],
})
export class BackupCodeModule {}
