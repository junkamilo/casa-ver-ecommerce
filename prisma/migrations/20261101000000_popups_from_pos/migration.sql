-- Popups publicitarios 100 % en el POS (md/COMPARACION-TABLAS-POPUPS-POS-vs-WEB.md).
--
-- Los popups se crean, programan y activan en el POS (catalog.promo_popups, V111; Diseño → Popups) y la web solo
-- pide el vigente de cada ubicación. El popup que había aquí lo sembró la V111 en el POS. La tabla promo_popups
-- se mueve al esquema "legacy_popups" (fuera de Prisma) como respaldo, sin borrar datos. Para eliminarla del todo:
-- DROP SCHEMA legacy_popups CASCADE;

CREATE SCHEMA IF NOT EXISTS "legacy_popups";

-- Los enums PromoPopupPlacement y CouponScheduleMode se retiran: las columnas pasan a texto antes de mover la tabla.
ALTER TABLE "promo_popups" ALTER COLUMN "placement" TYPE TEXT USING "placement"::TEXT;
ALTER TABLE "promo_popups" ALTER COLUMN "scheduleMode" DROP DEFAULT;
ALTER TABLE "promo_popups" ALTER COLUMN "scheduleMode" TYPE TEXT USING "scheduleMode"::TEXT;

ALTER TABLE "promo_popups" SET SCHEMA "legacy_popups";

-- El respaldo de cupones (20261026000000_coupons_from_pos) también usaba CouponScheduleMode.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = '_legacy_coupons' AND column_name = 'scheduleMode'
  ) THEN
    ALTER TABLE "_legacy_coupons" ALTER COLUMN "scheduleMode" DROP DEFAULT;
    ALTER TABLE "_legacy_coupons" ALTER COLUMN "scheduleMode" TYPE TEXT USING "scheduleMode"::TEXT;
  END IF;
END $$;

DROP TYPE IF EXISTS "PromoPopupPlacement";
DROP TYPE IF EXISTS "CouponScheduleMode";
