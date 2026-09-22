-- Historical note: 20260514120000_drop_two_factor_tables dropped "recovery_codes" and
-- "two_factor_secrets" in favor of Redis + user.twoFactorEnabled only. ADR-0004 knowingly revives
-- a persistent per-method table -- a boolean cannot represent independent TOTP/email-code state
-- (spec AC-30). Different shape from what was dropped; not an oversight.

-- CreateEnum
CREATE TYPE "SecondFactorMethodType" AS ENUM ('TOTP', 'EMAIL_CODE');

-- CreateTable
-- userId has NO FK: User lives in the "user" service's own database (no shared DB).
CREATE TABLE IF NOT EXISTS "second_factor_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "type" "SecondFactorMethodType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "second_factor_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "second_factor_methods_userId_type_key" ON "second_factor_methods"("userId", "type");
