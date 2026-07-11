# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json yarn.lock ./

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN yarn install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Compilar TypeScript → dist/
RUN yarn build

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo lo necesario para producción
COPY package.json yarn.lock ./

# Instalar SOLO dependencias de producción (más liviano)
RUN yarn install --frozen-lockfile --production

# Copiar el build compilado desde el stage anterior
COPY --from=builder /app/dist ./dist

# Render inyecta el puerto via la variable PORT; NestJS escucha en 3000 por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Comando de inicio en producción
CMD ["node", "dist/main"]
