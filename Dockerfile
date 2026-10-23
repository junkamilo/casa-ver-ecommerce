FROM node:22-alpine AS base
# Prisma 5 necesita OpenSSL en Alpine
RUN apk add --no-cache openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# El postinstall ejecuta prisma generate y necesita el schema
COPY prisma ./prisma
RUN npm ci

FROM base AS build
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_POS_MEDIA_BASE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_LAUNCH_AT
ARG NEXT_PUBLIC_LAUNCH_LOCK_ENABLED
ARG NEXT_PUBLIC_BOLD_IDENTITY_KEY
ARG NEXT_PUBLIC_BUNNY_CDN_URL
ARG NEXT_PUBLIC_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG EXTRA_SERVER_ACTION_ORIGINS=""
ENV EXTRA_SERVER_ACTION_ORIGINS=$EXTRA_SERVER_ACTION_ORIGINS
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
    NEXT_PUBLIC_POS_MEDIA_BASE_URL=$NEXT_PUBLIC_POS_MEDIA_BASE_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_LAUNCH_AT=$NEXT_PUBLIC_LAUNCH_AT \
    NEXT_PUBLIC_LAUNCH_LOCK_ENABLED=$NEXT_PUBLIC_LAUNCH_LOCK_ENABLED \
    NEXT_PUBLIC_BOLD_IDENTITY_KEY=$NEXT_PUBLIC_BOLD_IDENTITY_KEY \
    NEXT_PUBLIC_BUNNY_CDN_URL=$NEXT_PUBLIC_BUNNY_CDN_URL \
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=$NEXT_PUBLIC_RECAPTCHA_SITE_KEY \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    SENTRY_ORG=$SENTRY_ORG \
    SENTRY_PROJECT=$SENTRY_PROJECT \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# No se usa "npm run build" porque ese script aplica migraciones
RUN --mount=type=secret,id=db_build_url sh -c 'export DATABASE_URL="$(cat /run/secrets/db_build_url)" && export DIRECT_URL="$DATABASE_URL" && npx prisma generate && npx next build'

FROM base AS runtime
# next start vuelve a evaluar next.config.ts, así que la variable también hace falta aquí
ARG EXTRA_SERVER_ACTION_ORIGINS=""
ENV EXTRA_SERVER_ACTION_ORIGINS=$EXTRA_SERVER_ACTION_ORIGINS
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/package.json ./package.json
# next start vuelve a cargar next.config.ts (imágenes remotas, orígenes, headers) y su import local
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
COPY --from=build --chown=node:node /app/src/lib/image-hosts.ts ./src/lib/image-hosts.ts
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
