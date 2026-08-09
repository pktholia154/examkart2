# Multistage production Dockerfile for Next.js App on Google Cloud Run
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy lock files and package.json
COPY package.json package-lock.json* ./
RUN npm ci || npm install

# Rebuild the source code
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry disabled during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Dummy fallback env vars for static build evaluation
ENV NEXT_PUBLIC_FIREBASE_API_KEY="placeholder"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="placeholder"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="placeholder"

RUN npm run build

# Production runner image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p public
COPY --from=builder /app/public ./public

# Copy Next.js standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]

