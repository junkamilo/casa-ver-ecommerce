/**
 * Envía un aviso firmado a /api/pos-webhook, igual que lo haría el POS.
 *
 * Uso:
 *   node scripts/send-test-pos-webhook.mjs <entityType> <id> [action] [--url=...] [--event-id=...]
 *
 *   node scripts/send-test-pos-webhook.mjs product blusa-lino
 *   node scripts/send-test-pos-webhook.mjs product blusa-lino stock_changed
 *   node scripts/send-test-pos-webhook.mjs category mujer-01 removed --url=https://casaverdeoficial.com
 *   node scripts/send-test-pos-webhook.mjs product blusa-lino upserted --event-id=evt-1   # probar duplicados
 *   node scripts/send-test-pos-webhook.mjs product blusa-lino upserted --bad-signature     # debe dar 401
 *   node scripts/send-test-pos-webhook.mjs shipping shipping                               # vuelve a copiar envíos
 *
 * entityType: category | subcategory | product | promotion | order | shipping | admin
 * action:     upserted (por defecto) | removed | stock_changed
 * Variables:  POS_WEBHOOK_SECRET (.env / .env.local).
 */
import { createHmac, randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
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

const ENTITY_TYPES = ["category", "subcategory", "product", "promotion", "order", "shipping", "admin"];
const ACTIONS = ["upserted", "removed", "stock_changed"];

const flags = process.argv.slice(2).filter((arg) => arg.startsWith("--"));
const [entityType, id, action = "upserted"] = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const flag = (name) => flags.find((f) => f.startsWith(`--${name}=`))?.slice(name.length + 3);

if (!ENTITY_TYPES.includes(entityType) || !id || !ACTIONS.includes(action)) {
  console.error(
    "Uso: node scripts/send-test-pos-webhook.mjs <category|subcategory|product> <id> [upserted|removed|stock_changed] [--url=...] [--event-id=...] [--bad-signature]",
  );
  process.exit(1);
}

const secret = process.env.POS_WEBHOOK_SECRET;
if (!secret) {
  console.error("Falta POS_WEBHOOK_SECRET en el entorno o en .env.local");
  process.exit(1);
}

const baseUrl = (flag("url") ?? "http://localhost:3000").replace(/\/+$/, "");
const eventId = flag("event-id") ?? randomUUID();
const event = `${entityType}.${action}`;
const body = JSON.stringify({
  eventId,
  event,
  entityType,
  id,
  action,
  occurredAt: new Date().toISOString(),
});

const timestamp = String(Math.floor(Date.now() / 1000));
const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`, "utf8").digest("hex");
const signature = flags.includes("--bad-signature") ? `sha256=${"0".repeat(64)}` : `sha256=${digest}`;

const started = Date.now();
const res = await fetch(`${baseUrl}/api/pos-webhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CasaVerde-Timestamp": timestamp,
    "X-CasaVerde-Signature": signature,
    "X-CasaVerde-Event-Id": eventId,
    "X-CasaVerde-Event": event,
  },
  body,
});

const text = await res.text();
console.log(`${res.status} ${res.statusText} en ${Date.now() - started} ms`);
console.log(`eventId: ${eventId}`);
console.log(text);
process.exit(res.ok ? 0 : 1);
