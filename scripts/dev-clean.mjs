import { rmSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const nextDir = path.join(process.cwd(), ".next");

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("[dev:clean] Cache .next eliminada.");
} catch (error) {
  console.warn("[dev:clean] No se pudo borrar .next:", error);
}

console.log("[dev:clean] Iniciando next dev…");

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
