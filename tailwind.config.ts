import type { Config } from "tailwindcss";

export default {
  darkMode: ["class", ".dark"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          light: "hsl(var(--brand-light))",
          dark: "hsl(var(--brand-dark))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
          light: "hsl(var(--gold-light))",
          dark: "hsl(var(--gold-dark))",
        },
        "surface-light": "hsl(var(--surface-light))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "calc(var(--radius) + 8px)",
        md: "calc(var(--radius) + 4px)",
        sm: "calc(var(--radius) + 2px)",
      },
      boxShadow: {
        premium: "0 1px 3px 0 rgba(21,71,52,0.04), 0 4px 12px 0 rgba(21,71,52,0.06)",
        "premium-lg": "0 4px 16px 0 rgba(21,71,52,0.08), 0 8px 24px 0 rgba(21,71,52,0.10)",
        gold: "0 4px 14px -2px rgba(193,154,107,0.35)",
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
        // Íconos flotan suavemente — efecto vivo y premium
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':  { transform: 'translateY(-3px)' },
        },
        // Halo dorado que pulsa alrededor de los íconos
        'glow-pulse': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.9)' },
          '50%':       { opacity: '0.85', transform: 'scale(1.4)' },
        },
        // Diamante separador que parpadea con brillo
        'diamond-breathe': {
          '0%, 100%': { opacity: '0.5', transform: 'rotate(45deg) scale(0.85)' },
          '50%':       { opacity: '1',   transform: 'rotate(45deg) scale(1.2)' },
        },
        // Barra de luz dorada que cruza la pantalla — firma de lujo
        'shine-sweep': {
          '0%':   { left: '-15%', opacity: '0' },
          '4%':   { opacity: '1' },
          '22%':  { left: '115%', opacity: '0' },
          '100%': { left: '115%', opacity: '0' },
        },
        // Línea de borde dorada superior que pulsa
        'border-shimmer': {
          '0%, 100%': { opacity: '0.4' },
          '50%':       { opacity: '1' },
        },
        // Texto "CASA VERDE" — el dorado aparece una vez, descansa en verde
        // 0–40%: reposo (verde puro) | 40–60%: barrido dorado | 60–100%: reposo
        'text-shimmer': {
          '0%':   { backgroundPosition: '0% center' },
          '40%':  { backgroundPosition: '0% center' },
          '60%':  { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        // Menú móvil — entra deslizando desde arriba con elasticidad
        'menu-slide': {
          '0%':   { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        // Hero — línea de scroll que viaja hacia abajo en el indicador lateral
        'scroll-line': {
          '0%':   { top: '-40%', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { top: '130%', opacity: '0' },
        },
        // Hero — barra activa del indicador de slide se llena de izquierda a derecha
        'progress-fill': {
          '0%':   { width: '0%' },
          '85%':  { width: '100%' },
          '100%': { width: '100%' },
        },
        // Hero — texto de copia entra flotando suavemente (variante hero)
        'hero-in': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        // 80s = scroll ultra-elegante, marca premium
        marquee:           'marquee 80s linear infinite',
        float:             'float 3.5s ease-in-out infinite',
        'glow-pulse':      'glow-pulse 2.5s ease-in-out infinite',
        'diamond-breathe': 'diamond-breathe 2s ease-in-out infinite',
        'shine-sweep':     'shine-sweep 9s ease-in-out infinite',
        'border-shimmer':  'border-shimmer 3s ease-in-out infinite',
        'text-shimmer':    'text-shimmer 14s ease-in-out infinite',
        'menu-slide':      'menu-slide 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scroll-line':     'scroll-line 2s ease-in-out infinite',
        'progress-fill':   'progress-fill 5s linear infinite',
        'hero-in':         'hero-in 0.8s ease-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
