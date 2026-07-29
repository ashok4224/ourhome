# Built from the monorepo root: docker build -f services/auth-service/Dockerfile .
FROM node:22-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci

COPY prisma ./prisma
COPY packages/shared ./packages/shared
COPY services/auth-service ./services/auth-service
RUN npm run build --workspace=services/auth-service

FROM node:22-alpine AS production
WORKDIR /repo

RUN addgroup -g 1001 -S ourhome && adduser -S ourhome -u 1001 -G ourhome

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/auth-service/package.json services/auth-service/package.json
RUN npm ci --omit=dev && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /repo/services/auth-service/dist ./services/auth-service/dist

USER ourhome
ENV NODE_ENV=production
ENV PORT=4001
EXPOSE 4001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:4001/health || exit 1

CMD ["node", "services/auth-service/dist/index.cjs"]
