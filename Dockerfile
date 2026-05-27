# Multi-stage Dockerfile — мастер на час (master39)
FROM node:lts-slim AS builder
WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm approve-builds prisma @prisma/engines
ENV DATABASE_URL=file:./data/dev.db
RUN npx prisma generate
RUN pnpm build

FROM node:lts-slim AS runner
WORKDIR /app

RUN npm install -g pnpm@latest
RUN apt-get update && apt-get install -y --no-install-recommends wget && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./

ENV DATABASE_URL=file:./data/dev.db
RUN mkdir -p ./data

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && node server.js"
