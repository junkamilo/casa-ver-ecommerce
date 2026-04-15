-- ============================================================
-- MIGRACIÓN: add_promotions
-- No-destructiva: solo crea tabla nueva y agrega columnas
-- Nunca modifica ni elimina columnas existentes
-- ============================================================

-- CreateTable: promotions
CREATE TABLE "promotions" (
    "id"                 TEXT         NOT NULL,
    "name"               TEXT         NOT NULL,
    "discountPercentage" INTEGER      NOT NULL DEFAULT 10,
    "maxUses"            INTEGER      NOT NULL DEFAULT 10,
    "currentUses"        INTEGER      NOT NULL DEFAULT 0,
    "isActive"           BOOLEAN      NOT NULL DEFAULT true,
    "startDate"          TIMESTAMP(3),
    "endDate"            TIMESTAMP(3),
    "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotions_isActive_idx" ON "promotions"("isActive");

-- AlterTable: orders — agregar FK opcional a promotions
ALTER TABLE "orders" ADD COLUMN "appliedPromotionId" TEXT;

-- AddForeignKey
ALTER TABLE "orders"
    ADD CONSTRAINT "orders_appliedPromotionId_fkey"
    FOREIGN KEY ("appliedPromotionId")
    REFERENCES "promotions"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Seed: insertar la promoción "Early Bird" sincronizando el contador
-- con los usuarios que ya tienen earlyBirdDiscount = true
INSERT INTO "promotions" (
    "id",
    "name",
    "discountPercentage",
    "maxUses",
    "currentUses",
    "isActive",
    "updatedAt"
) VALUES (
    'early-bird-2026',
    'Early Bird — Primeros 10 clientes de Casa Verde',
    10,
    10,
    (SELECT COUNT(*) FROM "users" WHERE "earlyBirdDiscount" = true),
    true,
    CURRENT_TIMESTAMP
);
