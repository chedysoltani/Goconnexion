# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests first (layer-cache friendly)
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (dev included for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production runner ─────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install prod deps only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npm cache clean --force

# Regenerate Prisma client for this image
RUN npx prisma generate

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Public folder (uploads subdir will be a named volume mounted over this)
RUN mkdir -p /app/public/uploads

EXPOSE 3001

# Run DB migrations then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
