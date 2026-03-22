-- CreateIndex
-- Índice en accounts.userId para acelerar los lookups del PrismaAdapter.
-- Sin este índice cada consulta de cuentas por usuario hace full scan.
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
