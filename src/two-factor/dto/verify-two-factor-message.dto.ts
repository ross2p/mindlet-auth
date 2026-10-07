import type { VerifyTwoFactorCodeType } from '@ross2p/types';

export class VerifyTwoFactorMessageDto implements VerifyTwoFactorCodeType {
  userId!: string;

  sessionId!: string;

  method!: VerifyTwoFactorCodeType['method'];

  code!: string;
}
