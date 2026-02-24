ALTER TABLE "User"
ADD COLUMN "cli_pin_hash" TEXT,
ADD COLUMN "cli_pin_updated_at" TIMESTAMP(3),
ADD COLUMN "cli_pin_last_used_at" TIMESTAMP(3),
ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;
