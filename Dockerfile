# Multi-stage Dockerfile for master39
# Builder stage
FROM node:20-slim AS builder
WORKDIR /app

RUN npm install -g pnpm@9

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .
ENV DATABASE_URL=file:./data/dev.db
RUN npx prisma generate
RUN pnpm run build

# Runner stage
FROM node:20-slim AS runner
WORKDIR /app
RUN mkdir -p ./data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

ENV DATABASE_URL=file:./data/dev.db
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
EXPOSE 3000

CMD sh -c "npx prisma migrate deploy && node server.js"
