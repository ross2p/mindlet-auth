import type { DisableSecondFactorMethodMessageType } from '@ross2p/types';

export class DisableSecondFactorMethodDto implements DisableSecondFactorMethodMessageType {
  userId!: string;
  type!: DisableSecondFactorMethodMessageType['type'];
}
