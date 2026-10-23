import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // eslint-plugin-react-hooks 7.1 (llega con eslint-config-next 16.4, H-06) endureció esta regla y marca
    // 29 hooks del admin que cargan datos en un efecto. Queda como aviso hasta migrarlos uno a uno.
    rules: { "react-hooks/set-state-in-effect": "warn" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma client generado (no editar a mano)
    "src/generated/prisma/**",
  ]),
]);

export default eslintConfig;
