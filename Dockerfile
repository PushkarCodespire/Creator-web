# Single-stage nginx image. Same artifact-based pattern as the canonical
# react-vite starter: the build is done in the CI `pnpm:build` job
# (stacks/react-vite.yml) which produces `dist/`. This Dockerfile is
# just packaging — no Node, no pnpm, no Vite inside. Running them again
# in the builder stage OOMKilled the CI runner (~6.3k modules, exit 137).
#
# Build context expectations (CI provides via `needs:` artifacts):
#   ./dist/                       vite-built static bundle
#   ./nginx-snippets/             config snippets the entrypoint composes
#                                 (api/proxy snippets included only when
#                                 API_BACKEND_URL is set at container start)
#   ./docker-entrypoint.sh        assembles snippets + renders nginx.conf
#
# Local build: run `pnpm install && pnpm build`, then `docker build .`.

ARG NGINX_VERSION=1.30

FROM nginx:${NGINX_VERSION}-alpine

# Replace the default nginx user (UID 101) with one matching the
# react-vite helm chart's runAsUser=1000. Pre-create temp/pid paths
# so the non-root process can run. `gettext` provides envsubst (used
# by the entrypoint to render the live nginx.conf at container start).
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

COPY --chown=1000:1000 dist/                 /usr/share/nginx/html/
COPY --chown=1000:1000 nginx-snippets/       /etc/nginx/snippets/
COPY --chown=1000:1000 docker-entrypoint.sh  /docker-entrypoint.sh
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
