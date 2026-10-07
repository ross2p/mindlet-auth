import { AuthTwoFactorProto } from '@ross2p/common';
import type { TwoFactorMethodType } from '@ross2p/types';

export function toTwoFactorChallenge(result: {
  methods: TwoFactorMethodType[];
}): AuthTwoFactorProto.TwoFactorChallenge {
  return {
    required: true,
    methods: result.methods.map((method) => ({
      id: method.id as AuthTwoFactorProto.TwoFactorMethodId,
      available: method.available,
    })),
  };
}
