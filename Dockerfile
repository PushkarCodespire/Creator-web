# ===========================================
# PRODUCTION DOCKERFILE - FRONTEND
# ===========================================
# Multi-stage. Stage 1 builds dist/ with Vite + pnpm; stage 2 packages
# dist/ behind nginx with the canonical react-vite layout — writes
# confined to /tmp, /etc/nginx fully read-only, restricted PSS compatible.

# Global ARG — must appear BEFORE the first FROM so BuildKit makes it
# available to all stages (an ARG declared between FROMs is scoped to
# the previous stage only and is undefined in the next FROM).
ARG NGINX_VERSION=1.30

# ---- Stage 1: Vite build ----
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# ---- Stage 2: nginx ----
FROM nginx:${NGINX_VERSION}-alpine

# Replace the default nginx user (UID 101) with one matching the
# react-vite helm chart's runAsUser=1000. Pre-create temp/pid paths so
# the non-root process can run. `gettext` provides envsubst (used by
# the entrypoint to render the live nginx.conf at container start).
#
# /etc/nginx STAYS READ-ONLY. The entrypoint renders the live
# nginx.conf to /tmp/nginx.conf instead, which lets the helm chart run
# this image with `readOnlyRootFilesystem: true` (restricted PSS).
# CMD passes `-c /tmp/nginx.conf` so nginx loads from there.
RUN deluser nginx \
 && addgroup -S -g 1000 nginx \
 && adduser  -S -u 1000 -G nginx -H -D nginx \
 && touch /tmp/nginx.pid \
 && chown 1000:1000 /tmp/nginx.pid /var/log/nginx \
 # Pull latest alpine package patches at build time so Trivy doesn't
 # fail on transient CVEs in the upstream nginx base.
 && apk upgrade --no-cache \
 && apk add --no-cache tini gettext

WORKDIR /usr/share/nginx/html

# Products group standardizes on port 8080 — the chart's containerPort
# and the gateway both expect it. Override via SERVER_PORT if needed.
ENV SERVER_PORT=8080

COPY --chown=1000:1000 --from=builder /app/dist /usr/share/nginx/html/
COPY --chown=1000:1000 nginx-snippets/             /etc/nginx/snippets/
COPY --chown=1000:1000 docker-entrypoint.sh        /docker-entrypoint.sh
RUN chmod 0755 /docker-entrypoint.sh

# Docker / OCI HEALTHCHECK. Kubernetes ignores this in favour of the
# helm chart's livenessProbe; useful for `docker ps` / docker-compose.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/healthz/liveness || exit 1

USER 1000
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--", "/docker-entrypoint.sh"]
# `-c /tmp/nginx.conf` matches where the entrypoint renders the live
# config; this keeps /etc/nginx fully read-only at runtime.
CMD ["nginx", "-c", "/tmp/nginx.conf", "-g", "daemon off;"]
