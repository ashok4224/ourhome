# Built from the monorepo root: docker build -f services/gateway/Dockerfile .
FROM node:22-alpine AS builder
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/gateway/package.json services/gateway/package.json
RUN npm ci

COPY . .
RUN npm run build --workspace=packages/shared --if-present
RUN npm run build --workspace=services/gateway
RUN npx vite build

FROM node:22-alpine AS production
WORKDIR /repo

RUN addgroup -g 1001 -S ourhome && adduser -S ourhome -u 1001 -G ourhome

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/package.json
COPY services/gateway/package.json services/gateway/package.json
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /repo/services/gateway/dist ./services/gateway/dist
COPY --from=builder /repo/dist ./dist

USER ourhome
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://localhost:3000/api/health || exit 1

CMD ["node", "services/gateway/dist/index.cjs"]
