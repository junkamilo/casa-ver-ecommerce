/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));

const mockRevalidateTag = jest.fn();
const mockRevalidatePath = jest.fn();
jest.mock("next/cache", () => ({
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
  unstable_cache: (fn: unknown) => fn,
}));

import fs from "node:fs";
import path from "node:path";
import {
  buildThemeCssVariables,
  DEFAULT_CASA_VERDE_THEME,
  hexToHslTriplet,
  posThemeTokensSchema,
} from "../contracts/pos-themes.schema";
import { fetchActiveThemeTokens, POS_THEME_CACHE_TAG } from "../infrastructure/pos-theme.client";
import { processPosEvent } from "../application/process-pos-event.use-case";

describe("Módulo de Temas Estacionales POS → Web", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      POS_API_BASE_URL: "https://pos.casaverde.test/api/public/catalog",
      POS_API_KEY: "test-api-key",
    };
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("construye variables CSS y tripletes HSL deterministas para el tema por defecto y temas festivos", () => {
    expect(hexToHslTriplet("#154734")).toBe("157 54% 18%");
    const css = buildThemeCssVariables(DEFAULT_CASA_VERDE_THEME);
    expect(css).toContain("--theme-primary: #154734;");
    expect(css).toContain("--theme-accent: #C19A6B;");
    expect(css).toContain('--theme-font-display: Georgia, "Times New Roman", serif;');
  });

  it("rechaza colores inválidos o versiones de esquema desconocidas en el contrato Zod", () => {
    expect(
      posThemeTokensSchema.safeParse({
        ...DEFAULT_CASA_VERDE_THEME,
        colors: { ...DEFAULT_CASA_VERDE_THEME.colors, primary: "javascript:alert(1)" },
      }).success,
    ).toBe(false);

    expect(
      posThemeTokensSchema.safeParse({
        ...DEFAULT_CASA_VERDE_THEME,
        schemaVersion: "2.0.0",
      }).success,
    ).toBe(false);
  });

  it("obtiene el tema activo desde el POS y usa el tag pos-theme", async () => {
    const blackFridayTokens = {
      ...DEFAULT_CASA_VERDE_THEME,
      name: "Black Friday 2026",
      slug: "black-friday-2026",
      colors: {
        ...DEFAULT_CASA_VERDE_THEME.colors,
        primary: "#0D0D0D",
        accent: "#C8102E",
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          id: "00000000-0000-0000-0000-000000000099",
          name: "Black Friday 2026",
          slug: "black-friday-2026",
          isDefault: false,
          status: "ACTIVE",
          schemaVersion: "1.0.0",
          validUntil: new Date(Date.now() + 3600_000).toISOString(),
          tokens: blackFridayTokens,
        },
      }),
    }) as unknown as typeof fetch;

    const result = await fetchActiveThemeTokens();
    expect(result.slug).toBe("black-friday-2026");
    expect(result.colors.primary).toBe("#0D0D0D");
    expect(global.fetch).toHaveBeenCalledWith(
      "https://pos.casaverde.test/api/public/theme/active",
      expect.objectContaining({
        next: { revalidate: 3600, tags: [POS_THEME_CACHE_TAG] },
      }),
    );
  });

  it("revierte autónomamente al tema Casa Verde si validUntil ya expiró o si el POS falla", async () => {
    const expiredTokens = {
      ...DEFAULT_CASA_VERDE_THEME,
      name: "Halloween Expirado",
      slug: "halloween-expirado",
      colors: {
        ...DEFAULT_CASA_VERDE_THEME.colors,
        primary: "#18121E",
      },
    };

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          name: "Halloween Expirado",
          slug: "halloween-expirado",
          isDefault: false,
          status: "ACTIVE",
          schemaVersion: "1.0.0",
          validUntil: new Date(Date.now() - 60_000).toISOString(),
          tokens: expiredTokens,
        },
      }),
    }) as unknown as typeof fetch;

    const expiredResult = await fetchActiveThemeTokens();
    expect(expiredResult.slug).toBe("casa-verde");
    expect(expiredResult.colors.primary).toBe("#154734");

    // Y si el POS está caído, también devuelve Casa Verde sin lanzar excepción
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("ECONNREFUSED")) as unknown as typeof fetch;
    const offlineResult = await fetchActiveThemeTokens();
    expect(offlineResult.slug).toBe("casa-verde");
  });

  it("purga el tag pos-theme y el layout raíz al recibir el webhook theme.activated", async () => {
    jest.spyOn(console, "info").mockImplementation(() => undefined);
    const res = await processPosEvent({
      entityType: "theme",
      id: "black-friday-2026",
      action: "activated",
    });

    expect(res).toEqual({ status: "revalidated", entityType: "theme", id: "black-friday-2026" });
    expect(mockRevalidateTag).toHaveBeenCalledWith(POS_THEME_CACHE_TAG, { expire: 0 });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("el CSS del tema pesa más que el :root de globals.css (gana sin importar el orden)", () => {
    expect(buildThemeCssVariables(DEFAULT_CASA_VERDE_THEME).startsWith("html:root {")).toBe(true);
  });

  it("la tienda no usa los colores de marca fijos en clases: siguen al tema activo", () => {
    // Si vuelve a aparecer `bg-[#154734]` o `text-[#C19A6B]`, esa parte de la tienda ignoraría los temas del POS.
    const root = path.resolve(__dirname, "../../..");
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!["generated", "__tests__", "email"].includes(entry.name)) walk(full);
        } else if (entry.name.endsWith(".tsx")) {
          const text = fs.readFileSync(full, "utf8");
          const hits = text.match(/(?<!scrollbar-thumb)-\[#(154734|c19a6b)\]/gi);
          if (hits) offenders.push(`${path.relative(root, full)} (${hits.length})`);
        }
      }
    };
    walk(root);
    expect(offenders).toEqual([]);
  });
});
