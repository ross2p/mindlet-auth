/**
 * Slim user shape returned by the user microservice over Kafka/RPC.
 * Mirrors public user fields without persistence-only columns.
 */
export interface AuthUserView {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  phoneNumber: string | null;
  accountId: string | null;
  emailVerifiedAt: Date | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
