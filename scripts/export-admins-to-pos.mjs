/**
 * Migración única de los administradores de la web al POS (Configuraciones → Usuarios, V98).
 *
 * Lee los usuarios con role = ADMIN de la base de la web y genera el SQL para el POS:
 *   - Quedan como "solo web" (pos_access = false, web_admin = true): en el POS se les da acceso si se quiere.
 *   - Conservan su contraseña: el hash bcrypt se guarda como {bcrypt}... (el POS lo verifica y lo
 *     rehace en Argon2 en el primer ingreso). Los que entraban solo con Google reciben una contraseña
 *     aleatoria inutilizable: siguen entrando con Google o se les asigna una desde el POS.
 *   - Si el email ya existe en el POS, solo se marca web_admin = true (se conserva su contraseña del POS).
 *
 * El SQL contiene hashes de contraseñas: no lo subas al repositorio y bórralo después de aplicarlo.
 *
 * Uso:
 *   node scripts/export-admins-to-pos.mjs <salida.sql>
 *   docker exec -i pos-casa-verde-postgres psql -U <usuario> -d <base> -v ON_ERROR_STOP=1 < salida.sql
 *
 * Orden de despliegue: POS con V98 → este SQL → web con la sincronización de administradores.
 */
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const output = process.argv[2];
if (!output) {
  console.error("Uso: node scripts/export-admins-to-pos.mjs <salida.sql>");
  process.exit(1);
}

const sql = (value) => (value === null || value === undefined ? "NULL" : `'${String(value).replace(/'/g, "''")}'`);

const prisma = new PrismaClient();
try {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { name: true, email: true, password: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const usable = admins.filter((a) => a.email);
  if (usable.length === 0) {
    console.error("La web no tiene administradores con email; no se generó nada.");
    process.exit(1);
  }

  const rows = [];
  let googleOnly = 0;
  for (const admin of usable) {
    let hash = admin.password;
    if (!hash || !/^\$2[aby]\$/.test(hash)) {
      hash = await bcrypt.hash(randomBytes(32).toString("base64url"), 12);
      googleOnly++;
    }
    const email = admin.email.trim().toLowerCase();
    const name = (admin.name ?? "").trim() || email.split("@")[0];
    rows.push(
      `INSERT INTO platform.users (full_name, email, password_hash, role_id, pos_access, web_admin, is_active, created_at)
VALUES (${sql(name.slice(0, 150))}, ${sql(email)}, ${sql(`{bcrypt}${hash}`)}, NULL, FALSE, TRUE, TRUE, ${sql(admin.createdAt.toISOString())})
ON CONFLICT ((lower(email))) DO UPDATE SET web_admin = TRUE, is_active = TRUE, updated_at = now();`,
    );
  }

  writeFileSync(
    output,
    `-- Administradores de la web → POS (${new Date().toISOString()}). Contiene hashes: no versionar.\nBEGIN;\n${rows.join("\n")}\nCOMMIT;\n`,
    { mode: 0o600 },
  );
  console.log(`${usable.length} administrador(es) exportados (${googleOnly} sin contraseña propia: entran con Google).`);
} finally {
  await prisma.$disconnect();
}
