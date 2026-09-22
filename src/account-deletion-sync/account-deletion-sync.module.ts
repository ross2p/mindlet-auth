import { Module } from '@nestjs/common';
import { AccountDeletionSyncController } from './account-deletion-sync.controller';

@Module({
  controllers: [AccountDeletionSyncController],
})
export class AccountDeletionSyncModule {}
