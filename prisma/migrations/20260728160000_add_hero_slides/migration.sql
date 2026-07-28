-- Additive: hero_slides (safe if already present)
CREATE TABLE IF NOT EXISTS "hero_slides" (
    "id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "mediaUrl" TEXT NOT NULL DEFAULT '',
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "headline" TEXT,
    "subheadline" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hero_slides_position_key" ON "hero_slides"("position");
CREATE INDEX IF NOT EXISTS "hero_slides_position_idx" ON "hero_slides"("position");
