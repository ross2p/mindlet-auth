-- Drop legacy 2FA tables (TOTP/recovery); login 2FA uses Redis + user.twoFactorEnabled only.
DROP TABLE IF EXISTS "recovery_codes";
DROP TABLE IF EXISTS "two_factor_secrets";
