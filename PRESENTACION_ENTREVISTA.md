# Casa Verde — eCommerce Full Stack
## Documentación Técnica para Presentación

---

## 1. DESCRIPCIÓN GENERAL DEL PROYECTO

**Casa Verde** es una plataforma de comercio electrónico Full Stack construida con tecnologías modernas de desarrollo web. El proyecto consiste en una tienda en línea para venta de ropa y accesorios, con sistema de administración completo, autenticación de usuarios, carrito de compras e integración con pasarelas de pago colombianas.

El proyecto fue desarrollado como una migración desde una solución anterior, adoptando las mejores prácticas actuales del ecosistema React/Next.js.

---

## 2. STACK TECNOLÓGICO

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework principal (App Router) |
| React | 19.2.3 | Librería de UI |
| TypeScript | 5 | Tipado estático |
| Tailwind CSS | v4 | Estilos (utility-first) |
| Lucide React | 0.56+ | Íconos |
| Sonner | 2.0 | Notificaciones (toasts) |
| Radix UI | 1.x | Componentes accesibles (accordion, slot) |

### Backend / API
| Tecnología | Versión | Uso |
|---|---|---|
| Next.js API Routes | 16 | REST API integrada en el mismo proyecto |
| Prisma ORM | 5.22 | Acceso a base de datos |
| PostgreSQL (Neon) | — | Base de datos relacional en la nube |
| NextAuth.js | v5 beta | Autenticación y sesiones |
| bcryptjs | 3.x | Hashing de contraseñas |
| Cloudinary | — | Almacenamiento de imágenes |

### Formularios y Validación
| Tecnología | Versión | Uso |
|---|---|---|
| React Hook Form | 7.71 | Manejo de formularios |
| Zod | 4.3 | Validación de esquemas |
| @hookform/resolvers | 5.x | Integración RHF + Zod |

### Testing
| Tecnología | Versión | Uso |
|---|---|---|
| Jest | 29.7 | Framework de pruebas |
| React Testing Library | 16.3 | Pruebas de componentes |
| jest-environment-jsdom | 29.7 | Ambiente DOM para pruebas |

---

## 3. ARQUITECTURA DEL SISTEMA

### Patrón Arquitectónico
El proyecto utiliza el **App Router de Next.js 16**, que permite co-localizar servidor y cliente en el mismo proyecto. La arquitectura está organizada en módulos independientes donde cada feature tiene sus propios tipos, hooks, componentes y tests.

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (Browser)                  │
│  React Components + Context API (Cart) + Hooks       │
├─────────────────────────────────────────────────────┤
│               NEXT.JS (Servidor/Edge)                │
│  App Router + API Routes + Middleware (Auth guard)   │
├─────────────────────────────────────────────────────┤
│                    SERVICIOS                         │
│  Prisma ORM │ NextAuth │ Cloudinary │ Bold │ Addi    │
├─────────────────────────────────────────────────────┤
│                  BASE DE DATOS                       │
│          PostgreSQL en Neon (serverless)             │
└─────────────────────────────────────────────────────┘
```

### Estructura de Carpetas Principal

```
src/
├── app/                    ← Rutas y páginas (Next.js App Router)
│   ├── admin/              ← Panel administrativo
│   ├── api/                ← API REST (Next.js Route Handlers)
│   ├── product/[slug]/     ← Página de producto individual
│   ├── perfil/             ← Perfil del usuario
│   ├── checkout/           ← Proceso de compra
│   ├── tienda/             ← Catálogo público
│   └── collections/[slug]/ ← Colecciones temáticas
├── components/             ← Componentes reutilizables
│   ├── layout/             ← Header, BestSellers, NewCollection, etc.
│   ├── shared/             ← ProductCarousel (componente compartido)
│   ├── CartDrawer/         ← Carrito lateral
│   ├── login/              ← Formulario de login
│   ├── register/           ← Formulario de registro
│   └── ui/                 ← Componentes base (Button, ImageUpload)
├── context/                ← React Context (Cart global)
└── lib/                    ← Utilidades (Prisma singleton, utils)
```

---

## 4. FUNCIONALIDADES PRINCIPALES

### 4.1 Catálogo de Productos
- Listado de productos con filtros por nombre, categoría y estado
- Página de detalle de producto (`/product/[slug]`) con:
  - Galería de imágenes con zoom
  - Selector de color y talla
  - Control de cantidad
  - Acordeón de información (descripción, materiales, guía de tallas)
  - Sección de beneficios
  - Reseñas de clientes
  - Productos recomendados
- Colecciones temáticas (`/collections/[slug]`)
- Carrusel de "Mejores Ventas" y "Nueva Colección" en la página principal

### 4.2 Carrito de Compras
- Estado global gestionado con **React Context API**
- Carrito lateral (drawer) con animaciones
- Operaciones: agregar, eliminar, cambiar cantidad
- Persistencia durante la sesión
- Subcomponentes especializados: `CartHeader`, `CartContent`, `CartPanel`, `CartOverlay`, `CartItemCard`, `CartFooter`, `CartEmptyState`, `QuantityControls`

### 4.3 Autenticación y Autorización
- **NextAuth v5 (beta)** con dos estrategias:
  - **Credentials**: Email + contraseña (hash con bcrypt)
  - **Google OAuth**: Login con cuenta de Google
- Estrategia de sesión: **JWT**
- Persistencia con **PrismaAdapter** (sesiones en DB)
- Roles de usuario: `USER` y `ADMIN`
- Rutas protegidas: `/admin/*` (solo ADMIN), `/perfil/*` (autenticado)

### 4.4 Panel Administrativo (`/admin`)
El panel tiene secciones para:
- **Dashboard** — Vista general del negocio
- **Productos** — CRUD completo de productos
- **Categorías** — Gestión de categorías y subcategorías
- **Pedidos** — Gestión de órdenes de compra
- **Administradores** — Gestión de usuarios con rol admin
- **Estadísticas** — Análisis de ventas
- **Perfil** — Perfil del administrador

#### Admin Productos — Arquitectura Detallada
La página de productos del admin es el módulo más completo del proyecto, con arquitectura limpia dividida en capas:

```
admin/productos/
├── page.tsx                ← Orquestador (solo coordina)
├── types.ts                ← Interfaces TypeScript
├── constants.ts            ← SIZES, formatPrice, getStockStatus
├── hooks/
│   ├── useProductList.ts   ← Fetch, filtros, delete, activar/desactivar
│   └── useProductForm.ts   ← Estado del formulario + buildPayload
└── components/
    ├── ProductsHeader.tsx
    ├── ProductFilters.tsx
    ├── ProductTable.tsx
    ├── ProductMobileList.tsx
    ├── ProductModal.tsx
    └── form/
        ├── GeneralInfoSection.tsx   ← Nombre, descripción, categoría
        ├── ImagesSection.tsx        ← Upload a Cloudinary
        ├── ColorsSection.tsx        ← Gestión de colores
        ├── ColorCard.tsx            ← Tarjeta individual de color
        ├── MaterialSection.tsx      ← Materiales y variantes
        └── SeoSection.tsx           ← Slug, meta description
```

### 4.5 Perfil de Usuario (`/perfil`)
- Información personal editable
- Historial de pedidos con:
  - Filtros por estado
  - Cards de pedidos con items expandibles
  - Estados: PENDING, PROCESSING, PAID, SHIPPED, DELIVERED, CANCELLED
  - Skeletons de carga
  - Estado vacío con feedback al usuario
- Sidebar de navegación con avatar y datos del usuario

### 4.6 Integraciones de Pago
- **Bold** — Pasarela de pagos con tarjeta (Colombia)
- **Addi** — Compras a crédito (Colombia)
- Webhooks para confirmación de pago en tiempo real
- Logs de webhooks en base de datos (`WebhookLog`)
- Reservas de stock temporales (`StockReservation`)

### 4.7 Gestión de Imágenes
- Upload a **Cloudinary** desde el panel admin
- Imágenes por producto y por color de producto
- Optimización automática (AVIF, WebP) vía next/image
- Soporte para múltiples imágenes por variante

---

## 5. DISEÑO DE BASE DE DATOS (Prisma Schema)

### Modelos y Relaciones

```
┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
│    User     │    │   Product   │    │  ProductColor   │
│─────────────│    │─────────────│    │─────────────────│
│ id          │    │ id          │◄───│ productId       │
│ name        │    │ name        │    │ name            │
│ email       │    │ slug        │    │ hexCode         │
│ password    │    │ description │    │ images[]        │
│ role        │    │ price       │    └─────────────────┘
│ phone       │    │ status      │              │
│ addresses[] │    │ featured    │    ┌─────────▼───────┐
└─────────────┘    │ categoryId  │    │ ProductVariant  │
       │           └─────────────┘    │─────────────────│
       │                  │           │ colorId         │
┌──────▼──────┐    ┌──────▼──────┐   │ size (enum)     │
│    Order    │    │  Category   │   │ stock           │
│─────────────│    │─────────────│   │ sku             │
│ userId      │    │ name        │   └─────────────────┘
│ status      │    │ slug        │
│ total       │    │ parentId    │
│ items[]     │    └─────────────┘
└─────────────┘
```

### Enums Definidos
- **Role**: `USER` | `ADMIN`
- **ProductStatus**: `ACTIVE` | `INACTIVE` | `DRAFT`
- **Size**: `XS` | `S` | `M` | `L` | `XL` | `XXL` | `ONESIZE`
- **OrderStatus**: `PENDING` | `PROCESSING` | `PAID` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `FAILED`
- **PaymentMethod**: `BOLD` | `ADDI` | `NEQUI` | `BANCOLOMBIA` | `DAVIPLATA`

### Total de modelos: 13
`Account`, `Session`, `User`, `Address`, `Category`, `Product`, `ProductColor`, `ProductImage`, `ProductVariant`, `Order`, `OrderItem`, `StockReservation`, `WebhookLog`

---

## 6. API REST (Route Handlers)

### Endpoints Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos activos |
| GET | `/api/products/[id]` | Detalle de producto |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/[...nextauth]` | Login (NextAuth handler) |

### Endpoints Admin (protegidos por rol)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/admin/products` | Listar / Crear producto |
| GET/PUT/DELETE | `/api/admin/products/[id]` | CRUD producto |
| GET/POST/PUT/DELETE | `/api/admin/categories` | CRUD categorías |
| GET/PUT/DELETE | `/api/admin/users` | Gestión de usuarios |

### Endpoints de Pago
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/payments/bold/create` | Crear link de pago Bold |
| POST | `/api/payments/bold/webhook` | Webhook Bold (confirmación) |
| POST | `/api/payments/addi/create` | Crear solicitud Addi |
| POST | `/api/payments/addi/webhook` | Webhook Addi (confirmación) |

### Otros Endpoints
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST/PUT | `/api/orders` | Gestión de órdenes |
| GET/PUT | `/api/profile` | Perfil del usuario |
| POST | `/api/upload` | Upload de imágenes a Cloudinary |

---

## 7. PATRONES Y BUENAS PRÁCTICAS IMPLEMENTADAS

### 7.1 Separación de Responsabilidades
Cada módulo (feature) está organizado en capas independientes:
- **types.ts** — Interfaces y tipos TypeScript
- **constants.ts** — Valores constantes y funciones helper puras
- **hooks/** — Lógica de negocio y estado (separada de la UI)
- **components/** — Solo presentación, reciben props
- **page.tsx** — Orquestador que conecta todo

### 7.2 Custom Hooks
Más de 15 hooks personalizados que separan la lógica de los componentes:
- `useProductList` — Fetch de productos, filtros, delete, toggle activo
- `useProductForm` — Estado del formulario + buildPayload para API
- `useCartDrawer` — Control de apertura/cierre del carrito
- `useOrders` — Fetch y filtrado de pedidos del usuario
- `useLoginForm` / `useRegisterForm` — Lógica de autenticación
- `useCarousel` — Lógica de carruseles (BestSellers, NewCollection, Categories)
- `useAutoScroll` — Auto-scroll para testimonios
- `useProfileNav` — Navegación del sidebar de perfil

### 7.3 TypeScript Strict Mode
- Tipado completo en todo el proyecto
- Interfaces para todos los modelos y props
- Tipos inferidos de Prisma para operaciones de DB

### 7.4 Componentes Atómicos
Cada componente visual tiene una sola responsabilidad. Ejemplo en CartDrawer:
- `CartPanel` controla el layout del panel
- `CartOverlay` es solo el fondo oscuro
- `CartHeader` es solo el encabezado
- `CartItemCard` es una tarjeta de ítem

### 7.5 Re-exports para Compatibilidad
Para mantener compatibilidad en importaciones:
```typescript
// src/components/Header.tsx
export { default } from './layout/Header'
```

### 7.6 Singleton Pattern para Prisma
En desarrollo, se evita múltiples instancias de PrismaClient:
```typescript
// src/lib/prisma.ts
const globalForPrisma = global as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 8. TESTING

### Configuración
- **Jest 29** con `jest-environment-jsdom`
- **React Testing Library** para pruebas de componentes
- **@testing-library/user-event** para simulación de interacciones
- Tests co-localizados en carpetas `__tests__/` junto a cada módulo

### Scripts disponibles
```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Modo watch (desarrollo)
npm run test:coverage # Reporte de cobertura
```

### Cobertura de Tests (+60 archivos)
Los tests cubren:
- **Componentes UI** — Renderizado correcto, props, interacciones
- **Hooks personalizados** — Lógica de estado y efectos
- **Funciones helper/constants** — Formato de precios, estados, validaciones
- **Integración** — Flujos completos (e.g., CartDrawer integration test)

### Ejemplo de Tests por Módulo
```
admin/productos/__tests__/
  ├── ProductFilters.test.tsx      ← Filtros de búsqueda
  ├── ProductsHeader.test.tsx      ← Encabezado con botón "nuevo"
  ├── ToastNotification.test.tsx   ← Notificaciones
  ├── constants.test.ts            ← formatPrice, getStockStatus
  └── useProductForm.test.ts       ← Hook de formulario

CartDrawer/__tests__/
  ├── CartDrawer.test.tsx          ← Componente principal
  ├── CartItemCard.test.tsx        ← Card de item
  ├── QuantityControls.test.tsx    ← Controles de cantidad
  ├── useCartDrawer.test.ts        ← Hook del drawer
  └── integration.test.tsx         ← Flujo completo
```

---

## 9. VARIABLES DE ENTORNO Y SERVICIOS EXTERNOS

```env
# Base de Datos
DATABASE_URL=postgresql://...    # Neon (PostgreSQL serverless)

# Autenticación
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...             # Google OAuth
GOOGLE_CLIENT_SECRET=...

# Pasarelas de Pago (Colombia)
BOLD_API_KEY=...
BOLD_WEBHOOK_SECRET=...
ADDI_API_KEY=...
ADDI_WEBHOOK_SECRET=...

# Imágenes
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_API_KEY=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=casaverde_preset

# Email
RESEND_API_KEY=...               # Envío de emails transaccionales

# Analytics
NEXT_PUBLIC_GA_ID=...            # Google Analytics
NEXT_PUBLIC_PIXEL_ID=...         # Meta Pixel (Facebook)
```

---

## 10. IDENTIDAD VISUAL Y UX

### Paleta de Colores de Marca
- **Verde Principal**: `#154734` — Color corporativo principal
- **Dorado**: `#C19A6B` — Color de acento y detalles

### Características UX
- **Diseño Responsive** — Vistas diferenciadas para móvil y desktop
- **Mega Menú** — Navegación con submenús desplegables
- **Menú Móvil** — Drawer lateral para navegación en smartphones
- **Carruseles** — Productos, colecciones, testimonios
- **Skeleton Loaders** — Feedback visual durante carga de datos
- **Toast Notifications** — Feedback de acciones (agregar al carrito, guardar producto)
- **Social Proof Popup** — Popup de actividad de compras recientes
- **Announcement Bar** — Barra de anuncios en la parte superior
- **Instagram CTA** — Sección de llamado a acción para redes sociales

---

## 11. DESPLIEGUE

- **Plataforma**: Vercel (según commits de historial git)
- **Base de Datos**: Neon (PostgreSQL serverless, compatible con Vercel)
- **Imágenes**: Cloudinary CDN
- **Branch principal**: `main`
- **Branch de desarrollo**: `case-verde-desarrollo`

---

## 12. RESUMEN EJECUTIVO PARA ENTREVISTA

> "Desarrollé una plataforma de eCommerce Full Stack para una marca de moda colombiana llamada Casa Verde. El proyecto está construido con **Next.js 16 y React 19**, usando el nuevo **App Router** que permite renderizado híbrido (SSR/CSR). Para la base de datos utilicé **PostgreSQL** con **Prisma ORM**, lo que me da seguridad de tipos desde la capa de datos hasta el frontend. La autenticación es manejada por **NextAuth v5** con soporte para Google OAuth y login con credenciales."
>
> "La arquitectura está organizada en módulos independientes donde cada feature tiene sus propios tipos, hooks personalizados, componentes y tests. Implementé más de 15 custom hooks para separar la lógica de negocio de los componentes de UI. El proyecto incluye un panel administrativo completo para gestión de productos, categorías, órdenes y usuarios, además de integración con pasarelas de pago colombianas (**Bold** y **Addi**) con soporte de webhooks."
>
> "Para testing, configuré **Jest con React Testing Library** con más de 60 archivos de test que cubren componentes, hooks y funciones utilitarias. El proyecto está desplegado en **Vercel** con la base de datos en **Neon** (PostgreSQL serverless)."

---

## 13. MÉTRICAS DEL PROYECTO

| Indicador | Valor |
|-----------|-------|
| Páginas públicas | 8+ |
| Páginas admin | 6 |
| API Routes | ~20 endpoints |
| Modelos en DB | 13 |
| Custom Hooks | 15+ |
| Componentes | 80+ |
| Archivos de Test | 60+ |
| Líneas de código aprox. | 8,000+ |
| Servicios externos integrados | 6 (Neon, Cloudinary, Google, Bold, Addi, Resend) |

---

*Documento generado para presentación en entrevista de trabajo — Casa Verde eCommerce*
