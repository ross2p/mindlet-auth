-- CreateTable
-- Backup codes (spec AC-31/AC-32). userId has NO FK -- cross-service, same reasoning as
-- second_factor_methods. Not FK'd to second_factor_methods either: codes are a whole-account
-- fallback, not tied to one method.
CREATE TABLE IF NOT EXISTS "backup_codes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "codeHash" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "backup_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "backup_codes_userId_idx" ON "backup_codes"("userId");
