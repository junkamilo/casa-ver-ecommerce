/**
 * Reenvía snapshots de accounting_sale_exports al webhook de contabilidad.
 *
 * Uso:
 *   node scripts/push-accounting-webhooks.mjs           # dry-run
 *   node scripts/push-accounting-webhooks.mjs --apply   # POST real
 *   node scripts/push-accounting-webhooks.mjs --apply --failed-only
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const APPLY = process.argv.includes("--apply");
const FAILED_ONLY = process.argv.includes("--failed-only");

const prisma = new PrismaClient();

function webhookToken() {
  return (
    process.env.ACCOUNTING_WEBHOOK_TOKEN?.trim() ||
    process.env.ACCOUNTING_WEBHOOK_SECRET?.trim() ||
    ""
  );
}

async function postPayload(payload) {
  const url = process.env.ACCOUNTING_WEBHOOK_URL?.trim();
  if (!url) throw new Error("ACCOUNTING_WEBHOOK_URL vacío");

  const body = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json" };
  const token = webhookToken();
  if (token) headers["X-Webhook-Token"] = token;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(15_000),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  return true;
}

async function main() {
  const url = process.env.ACCOUNTING_WEBHOOK_URL?.trim();
  console.log("=== push-accounting-webhooks ===");
  console.log(`Modo: ${APPLY ? "APPLY" : "DRY-RUN"}`);
  console.log(`URL: ${url || "(vacía)"}`);
  console.log(`Token: ${webhookToken() ? "(set)" : "(vacío)"}`);
  console.log(`Filtro: ${FAILED_ONLY ? "FAILED|SKIPPED" : "todos"}`);

  if (!url) {
    console.error("Configura ACCOUNTING_WEBHOOK_URL");
    process.exit(1);
  }

  const where = FAILED_ONLY
    ? { webhookStatus: { in: ["FAILED", "SKIPPED", "PENDING"] } }
    : {};

  const rows = await prisma.accountingSaleExport.findMany({
    where,
    orderBy: { paidAt: "asc" },
  });

  console.log(`Snapshots: ${rows.length}`);

  let ok = 0;
  let fail = 0;
  for (const row of rows) {
    const label = row.orderNumber;
    if (!APPLY) {
      console.log(`  [dry] ${label}`);
      ok += 1;
      continue;
    }
    try {
      await postPayload(row.payload);
      await prisma.accountingSaleExport.update({
        where: { id: row.id },
        data: {
          webhookStatus: "SENT",
          webhookAttempts: { increment: 1 },
          webhookSentAt: new Date(),
          webhookError: null,
        },
      });
      console.log(`  ok ${label}`);
      ok += 1;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await prisma.accountingSaleExport.update({
        where: { id: row.id },
        data: {
          webhookStatus: "FAILED",
          webhookAttempts: { increment: 1 },
          webhookError: message.slice(0, 500),
        },
      });
      console.log(`  FAIL ${label}: ${message}`);
      fail += 1;
    }
  }

  console.log(`\nListo. ok=${ok} fail=${fail}`);
  if (!APPLY) console.log("Usa --apply para enviar de verdad.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
