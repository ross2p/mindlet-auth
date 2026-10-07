import { AuthTwoFactorMethodProto } from '@ross2p/common';
import type { EnableSecondFactorMethodResultType } from '@ross2p/types';
import { TwoFactorMethodEntity } from './two-factor-method.entity';

export function toTwoFactorMethodList(
  methods: TwoFactorMethodEntity[],
): AuthTwoFactorMethodProto.TwoFactorMethodList {
  return {
    methods: methods.map((method) => ({
      ...method,
      type: method.type as AuthTwoFactorMethodProto.SecondFactorMethodType,
    })),
  };
}

export function toEnableTwoFactorMethodResult(
  result: EnableSecondFactorMethodResultType,
): AuthTwoFactorMethodProto.EnableTwoFactorMethodResult {
  return { backupCodes: result.backupCodes ?? [] };
}
