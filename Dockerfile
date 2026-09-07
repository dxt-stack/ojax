# syntax=docker/dockerfile:1
# OjaX — single-container production image (API + built SPA + uploads volume).
#
# Hard rules enforced at runtime (see docs/DEPLOYMENT.md):
#   NODE_ENV=production   -> never demo-seeds, enables CSP + static caching
#   DATABASE_URL          -> Postgres connection string
#   JWT_SECRET            -> openssl rand -hex 32
#   UPLOAD_ROOT=/data/uploads with a persistent volume mounted at /data
#     (uploads are user content — without a volume they are lost on redeploy)

# ---------------------------------------------------------------------------
# deps — install with lockfiles for reproducibility
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/
RUN cd /app/server && npm ci --omit=dev --no-audit --no-fund && \
    cd /app/client && npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
# build — server tsc + client vite
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/server/node_modules ./server/node_modules
COPY --from=deps /app/client/node_modules ./client/node_modules
COPY server/package.json ./server/
COPY server/tsconfig.json ./server/
COPY server/src ./server/src
RUN cd server && npm run build
# context excludes client/node_modules via .dockerignore; npm ci'd ones above survive
COPY client ./client
RUN cd client && npm run build

# ---------------------------------------------------------------------------
# runtime — minimal: prod deps + compiled server + built SPA
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4000 \
    UPLOAD_ROOT=/data/uploads
WORKDIR /app
COPY --from=deps   /app/server/node_modules ./server/node_modules
COPY --from=build  /app/server/dist ./server/dist
COPY --from=build  /app/client/dist ./client/dist
RUN mkdir -p /data/uploads && chown -R node:node /data /app
USER node
WORKDIR /app/server
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:4000/healthz').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "dist/index.js"]
