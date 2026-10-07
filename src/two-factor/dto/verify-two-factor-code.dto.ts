import type { VerifyTwoFactorCodeType } from '@ross2p/types';

export class VerifyTwoFactorCodeDto implements VerifyTwoFactorCodeType {
  method!: VerifyTwoFactorCodeType['method'];

  code!: string;
}
