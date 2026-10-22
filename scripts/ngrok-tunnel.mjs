/**
 * Abre el túnel ngrok hacia `next dev` con el dominio fijo de NEXT_PUBLIC_APP_URL, para que
 * Bold/Addi puedan llamar a los webhooks y callbacks en local.
 *
 * Uso:
 *   npm run tunnel              # puerto 3000
 *   npm run tunnel -- --port=3001
 *
 * Requisitos: ngrok v3 en el PATH (o en %LOCALAPPDATA%\Programs\ngrok) y el authtoken configurado
 * (`ngrok config add-authtoken <token>`). El dominio se toma de NGROK_DOMAIN o de NEXT_PUBLIC_APP_URL.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

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

function resolveDomain() {
  if (process.env.NGROK_DOMAIN) return process.env.NGROK_DOMAIN.trim();
  try {
    const { hostname } = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "");
    return hostname.endsWith(".ngrok-free.dev") || hostname.endsWith(".ngrok-free.app") || hostname.endsWith(".ngrok.app")
      ? hostname
      : null;
  } catch {
    return null;
  }
}

function resolveBinary() {
  const local = join(process.env.LOCALAPPDATA ?? "", "Programs", "ngrok", "ngrok.exe");
  return process.platform === "win32" && existsSync(local) ? local : "ngrok";
}

const domain = resolveDomain();
if (!domain) {
  console.error("Defina NGROK_DOMAIN o NEXT_PUBLIC_APP_URL=https://<su-dominio>.ngrok-free.dev en .env");
  process.exit(1);
}

const port = process.argv.find((arg) => arg.startsWith("--port="))?.slice("--port=".length) ?? "3000";
console.log(`Túnel https://${domain} -> http://localhost:${port}`);

const child = spawn(resolveBinary(), ["http", port, `--url=${domain}`], { stdio: "inherit" });
child.on("error", (error) => {
  console.error("No se pudo ejecutar ngrok. Instálelo y agréguelo al PATH:", error.message);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 0));
