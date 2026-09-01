-- AlterTable
ALTER TABLE "hero_slides" ADD COLUMN IF NOT EXISTS "playFullVideo" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE IF NOT EXISTS "hero_settings" (
    "id" INTEGER NOT NULL,
    "slideDurationMs" INTEGER NOT NULL DEFAULT 6000,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_settings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton
INSERT INTO "hero_settings" ("id", "slideDurationMs", "updatedAt")
VALUES (1, 6000, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
