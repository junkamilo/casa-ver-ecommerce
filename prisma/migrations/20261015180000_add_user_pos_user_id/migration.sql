-- Administradores gestionados por el POS: la cuenta queda enlazada al usuario del POS. Aditiva.

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "posUserId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_posUserId_key" ON "users"("posUserId");
