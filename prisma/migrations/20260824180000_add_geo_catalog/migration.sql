-- Additive: catálogo geográfico (Country -> Department -> Municipality)
-- No toca ninguna tabla existente. Sin datos, solo estructura.

CREATE TABLE IF NOT EXISTS "countries" (
    "id" TEXT NOT NULL,
    "isoCode2" TEXT NOT NULL,
    "isoCode3" TEXT NOT NULL,
    "numericCode" TEXT,
    "name" TEXT NOT NULL,
    "phoneCode" TEXT,
    "currency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "countries_isoCode2_key" ON "countries"("isoCode2");
CREATE UNIQUE INDEX IF NOT EXISTS "countries_isoCode3_key" ON "countries"("isoCode3");
CREATE UNIQUE INDEX IF NOT EXISTS "countries_numericCode_key" ON "countries"("numericCode");
CREATE UNIQUE INDEX IF NOT EXISTS "countries_name_key" ON "countries"("name");

CREATE TABLE IF NOT EXISTS "departments" (
    "id" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "daneCode" TEXT,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "departments_countryId_name_key" ON "departments"("countryId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "departments_countryId_daneCode_key" ON "departments"("countryId", "daneCode");
CREATE INDEX IF NOT EXISTS "departments_normalizedName_idx" ON "departments"("normalizedName");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'departments_countryId_fkey'
  ) THEN
    ALTER TABLE "departments"
      ADD CONSTRAINT "departments_countryId_fkey"
      FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "municipalities" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "daneCode" TEXT,
    "name" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "municipalities_departmentId_normalizedName_key" ON "municipalities"("departmentId", "normalizedName");
CREATE UNIQUE INDEX IF NOT EXISTS "municipalities_daneCode_key" ON "municipalities"("daneCode");
CREATE INDEX IF NOT EXISTS "municipalities_normalizedName_idx" ON "municipalities"("normalizedName");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'municipalities_departmentId_fkey'
  ) THEN
    ALTER TABLE "municipalities"
      ADD CONSTRAINT "municipalities_departmentId_fkey"
      FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
