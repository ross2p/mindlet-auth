import { UserCoreProto } from '@ross2p/common';
import type { AuthUserView } from '../auth/types/auth-user.view';

/**
 * proto3 message-typed fields (Timestamp here) can never be guaranteed
 * non-null at the wire level, so UserRecord.createdAt/updatedAt are typed
 * `Date | null` even though the server always sets them. This narrows that
 * one guarantee TS can't express structurally; every other field already
 * matches AuthUserView exactly (both `T | null`, no `| undefined`).
 */
export function toAuthUserView(record: UserCoreProto.UserRecord): AuthUserView {
  return {
    ...record,
    createdAt: record.createdAt!,
    updatedAt: record.updatedAt!,
  };
}
