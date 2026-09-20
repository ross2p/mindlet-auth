import type { BeginEnableSecondFactorMethodMessageType } from '@ross2p/types';

export class BeginEnableSecondFactorMethodDto implements BeginEnableSecondFactorMethodMessageType {
  userId!: string;
  type!: BeginEnableSecondFactorMethodMessageType['type'];
}
