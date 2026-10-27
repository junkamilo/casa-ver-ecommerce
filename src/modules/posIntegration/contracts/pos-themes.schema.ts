import { z } from "zod";

// Espejo de `ThemeDtos.PublicThemeDto` y `ThemeDtos.ThemeTokensDto` del POS
// (md/PLAN-IMPLEMENTACION-MODULO-TEMAS-POS-vs-WEB.md §2).
// El tema es DATOS validados (hex, fuentes de lista blanca, radios), nunca CSS ni JS arbitrario.

const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);

export const posThemeColorsSchema = z.object({
  primary: hexColorSchema,
  primaryForeground: hexColorSchema,
  accent: hexColorSchema,
  accentForeground: hexColorSchema,
  background: hexColorSchema,
  surface: hexColorSchema,
  text: hexColorSchema,
  border: hexColorSchema,
});

export const posThemeTypographySchema = z.object({
  fontDisplay: z.enum(["georgia", "playfair", "cinzel", "cormorant", "inter"]).catch("georgia"),
  fontBody: z.enum(["sans", "inter", "roboto"]).catch("sans"),
});

export const posThemeRadiusSchema = z.enum(["none", "sm", "md", "lg", "full"]).catch("md");

export const posThemeAnnouncementBarSchema = z.object({
  enabled: z.boolean().default(true),
  text: z.string().max(160).nullish().transform((v) => v ?? null),
  linkUrl: z.string().nullish().transform((v) => v ?? "/tienda"),
});

export const posThemeTokensSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  name: z.string().min(1).max(80),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  colors: posThemeColorsSchema,
  typography: posThemeTypographySchema,
  radius: posThemeRadiusSchema,
  seasonalBadge: z.string().max(60).nullish().transform((v) => v ?? null),
  announcementBar: posThemeAnnouncementBarSchema.nullish().transform(
    (v) =>
      v ?? {
        enabled: true,
        text: "Envíos gratis a toda Colombia por compras superiores a $150.000",
        linkUrl: "/tienda",
      },
  ),
});

export const posActiveThemeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  isDefault: z.boolean().default(false),
  status: z.string().default("ACTIVE"),
  schemaVersion: z.literal("1.0.0"),
  previewImageUrl: z.string().nullish().transform((v) => v ?? null),
  validUntil: z.string().nullish().transform((v) => v ?? null),
  tokens: posThemeTokensSchema,
});

export type PosThemeColors = z.infer<typeof posThemeColorsSchema>;
export type PosThemeTokens = z.infer<typeof posThemeTokensSchema>;
export type PosActiveTheme = z.infer<typeof posActiveThemeSchema>;

/** Tema canónico por defecto "Casa Verde" (respaldo inmutable cuando no hay campaña o el POS está offline). */
export const DEFAULT_CASA_VERDE_THEME: PosThemeTokens = {
  schemaVersion: "1.0.0",
  name: "Casa Verde",
  slug: "casa-verde",
  colors: {
    primary: "#154734",
    primaryForeground: "#FFFFFF",
    accent: "#C19A6B",
    accentForeground: "#FFFFFF",
    background: "#FFFFFF",
    surface: "#F9F9F7",
    text: "#1A1A1A",
    border: "#E5E5E0",
  },
  typography: {
    fontDisplay: "georgia",
    fontBody: "sans",
  },
  radius: "md",
  seasonalBadge: "Moda con esencia natural",
  announcementBar: {
    enabled: true,
    text: "Envíos gratis a toda Colombia por compras superiores a $150.000",
    linkUrl: "/tienda",
  },
};

const RADIUS_TO_PX: Record<PosThemeTokens["radius"], string> = {
  none: "0rem",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.875rem",
  full: "9999px",
};

const FONT_DISPLAY_TO_FAMILY: Record<PosThemeTokens["typography"]["fontDisplay"], string> = {
  georgia: 'Georgia, "Times New Roman", serif',
  playfair: '"Playfair Display", Georgia, serif',
  cinzel: "Cinzel, Georgia, serif",
  cormorant: '"Cormorant Garamond", Georgia, serif',
  inter: "Inter, system-ui, sans-serif",
};

const FONT_BODY_TO_FAMILY: Record<PosThemeTokens["typography"]["fontBody"], string> = {
  sans: '"Helvetica Neue", Arial, sans-serif',
  inter: "Inter, system-ui, sans-serif",
  roboto: "Roboto, Arial, sans-serif",
};

/** Convierte un color hexadecimal #RRGGBB al formato triplete HSL de Tailwind (`H S% L%`). */
export function hexToHslTriplet(hex: string): string {
  const clean = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex.slice(1) : "154734";
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Construye el bloque CSS determinista (< 900 bytes) que se inyecta en el `<head>` del `RootLayout`
 * para transformar toda la tienda web sin recargar paquetes ni causar FOUC. El selector `html:root` pesa más
 * que el `:root` de globals.css, así que el tema gana sin depender del orden de las hojas de estilo.
 */
export function buildThemeCssVariables(tokens: PosThemeTokens = DEFAULT_CASA_VERDE_THEME): string {
  const c = tokens.colors;
  const primaryHsl = hexToHslTriplet(c.primary);
  const primaryFgHsl = hexToHslTriplet(c.primaryForeground);
  const accentHsl = hexToHslTriplet(c.accent);
  const accentFgHsl = hexToHslTriplet(c.accentForeground);
  const bgHsl = hexToHslTriplet(c.background);
  const surfaceHsl = hexToHslTriplet(c.surface);
  const textHsl = hexToHslTriplet(c.text);
  const borderHsl = hexToHslTriplet(c.border);
  const radiusVal = RADIUS_TO_PX[tokens.radius] ?? "0.5rem";
  const fontDisplay = FONT_DISPLAY_TO_FAMILY[tokens.typography.fontDisplay] ?? FONT_DISPLAY_TO_FAMILY.georgia;
  const fontBody = FONT_BODY_TO_FAMILY[tokens.typography.fontBody] ?? FONT_BODY_TO_FAMILY.sans;

  return `html:root {
  --theme-primary: ${c.primary};
  --theme-primary-fg: ${c.primaryForeground};
  --theme-accent: ${c.accent};
  --theme-accent-fg: ${c.accentForeground};
  --theme-bg: ${c.background};
  --theme-surface: ${c.surface};
  --theme-text: ${c.text};
  --theme-border: ${c.border};
  --theme-radius: ${radiusVal};
  --theme-font-display: ${fontDisplay};
  --theme-font-body: ${fontBody};
  --primary: ${primaryHsl};
  --primary-foreground: ${primaryFgHsl};
  --accent: ${accentHsl};
  --accent-foreground: ${accentFgHsl};
  --brand: ${primaryHsl};
  --brand-foreground: ${primaryFgHsl};
  --gold: ${accentHsl};
  --gold-foreground: ${accentFgHsl};
  --background: ${bgHsl};
  --foreground: ${textHsl};
  --secondary: ${surfaceHsl};
  --surface-light: ${surfaceHsl};
  --border: ${borderHsl};
  --ring: ${primaryHsl};
}`;
}
