# Built from the monorepo root: docker build -f services/properties-service/Dockerfile .
FROM node:22-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/properties-service/package.json services/properties-service/package.json
RUN npm ci

COPY prisma ./prisma
COPY packages/shared ./packages/shared
COPY services/properties-service ./services/properties-service
RUN npm run build --workspace=services/properties-service

FROM node:22-alpine AS production
WORKDIR /repo

RUN addgroup -g 1001 -S ourhome && adduser -S ourhome -u 1001 -G ourhome

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/properties-service/package.json services/properties-service/package.json
RUN npm ci --omit=dev && npm cache clean --force

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /repo/services/properties-service/dist ./services/properties-service/dist

USER ourhome
ENV NODE_ENV=production
ENV PORT=4002
EXPOSE 4002

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:4002/health || exit 1

CMD ["node", "services/properties-service/dist/index.cjs"]
