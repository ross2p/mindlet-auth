import { UserCoreProto } from '@ross2p/common';
import type { AuthUserView } from '../auth/dto/auth-user.view';

/**
 * UserRecord's optional/message-typed fields are all typed with a trailing
 * `| undefined` (ts-proto marks every such field as possibly absent) but the
 * server always sets them — this narrows back to AuthUserView's guarantees
 * (Date, not Date|undefined; null, not null|undefined), mirroring
 * gateway-web's auth-response.mapper.ts.
 */
export function toAuthUserView(record: UserCoreProto.UserRecord): AuthUserView {
  return {
    ...record,
    displayName: record.displayName ?? null,
    bio: record.bio ?? null,
    avatarUrl: record.avatarUrl ?? null,
    bannerUrl: record.bannerUrl ?? null,
    phoneNumber: record.phoneNumber ?? null,
    accountId: record.accountId ?? null,
    emailVerifiedAt: record.emailVerifiedAt ?? null,
    createdAt: record.createdAt!,
    updatedAt: record.updatedAt!,
  };
}
