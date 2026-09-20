import type { ConfirmEnableSecondFactorMethodMessageType } from '@ross2p/types';

export class ConfirmEnableSecondFactorMethodDto implements ConfirmEnableSecondFactorMethodMessageType {
  userId!: string;
  type!: ConfirmEnableSecondFactorMethodMessageType['type'];
  code!: string;
}
