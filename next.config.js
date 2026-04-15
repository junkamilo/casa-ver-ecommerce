/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cachear imágenes optimizadas por 24 h en el servidor (default Next.js = 60s, muy poco)
    minimumCacheTTL: 86400,
    // Tamaños de dispositivo que Next.js usa para generar el srcset
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [96, 128, 192, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.google.com',
      },
    ],
  },

  async headers() {
    return [
      {
        // Aplica a todas las rutas
        source: "/(.*)",
        headers: [
          // Previene que el sitio sea embebido en iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita que el navegador adivine el tipo MIME (ataques MIME-sniffing)
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Filtro XSS en navegadores antiguos
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Controla qué info del referer se envía a terceros
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Deshabilita funciones del navegador que no necesita la tienda
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      allowedOrigins:
        process.env.NODE_ENV === "production"
          ? ["casaverdeoficial.com", "www.casaverdeoficial.com"]
          : ["localhost:3000"],
    },
    // Evita que el router cache del cliente sirva layouts/páginas dinámicas con datos obsoletos.
    // staleTimes.dynamic=0 → Next.js siempre pide datos frescos al servidor en soft-navigation.
    staleTimes: {
      dynamic: 0,
    },
  },
};

module.exports = nextConfig;
