-- DropTable
-- La tabla sessions nunca se utiliza porque la estrategia de sesión es JWT.
-- Con JWT las sesiones viven en cookies del navegador, no en la base de datos.
-- PrismaAdapter no llama los métodos de sesión cuando strategy = "jwt".
DROP TABLE "sessions";
