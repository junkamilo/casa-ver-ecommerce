-- Art-direction: optional mobile/tablet media URLs per hero slide
ALTER TABLE "hero_slides" ADD COLUMN IF NOT EXISTS "mediaUrlMobile" TEXT;
ALTER TABLE "hero_slides" ADD COLUMN IF NOT EXISTS "mediaUrlTablet" TEXT;
