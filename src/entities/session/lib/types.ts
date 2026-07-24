/**
 * Shape of the decoded access token payload returned by the backend.
 * Keep in sync with AccessTokenPayload in libs/shared/src/api/auth/refresh.ts.
 */
export type AccessPayload = {
  id: string;
  email: string;
  sessionId: string;
  twoFactorVerifiedAt: string | null;
  emailVerifiedAt: string | null;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
};

/** Shape of a token envelope returned by the backend (TokenPayloadDto). */
export type TokenDto = {
  token: string;
  payload: AccessPayload;
  expiresAt: string;
};

/** Minimal user fields returned alongside tokens after login/register. */
export type AuthUser = {
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
  emailVerifiedAt: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Shape of data returned by POST /auth/credentials/login and /register. */
export type AuthTokensData = {
  user: AuthUser;
  is2faEnabled: boolean;
  sessionId?: string;
  platformAccessOpen?: boolean;
  twoFactorChallenge?: {
    required: boolean;
    methods: Array<{ id: string; available: boolean }>;
  } | null;
  accessToken: TokenDto;
  refreshToken: TokenDto;
};
