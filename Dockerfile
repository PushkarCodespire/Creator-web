# Unprivileged nginx: runs as non-root, listens on 8080, keeps its pid +
# temp files under /tmp — so the container works under the react-vite
# chart's hardened securityContext (readOnlyRootFilesystem, runAsNonRoot).
#
# Build context expectations (provided by the CI pnpm:build artifact):
#   ./dist/                       vite-built static bundle
#   ./nginx/default.conf          server block, included by base /etc/nginx/nginx.conf
#   ./nginx-snippets/             api-proxy templates, rendered to /tmp at startup
#   ./docker-entrypoint.sh        envsubst + exec nginx
#
# Local build: `pnpm install && pnpm build`, then `docker build .`.

FROM nginxinc/nginx-unprivileged:1.27-alpine

# apk upgrade + COPY/chmod need root; drop back to the unprivileged user.
USER root
RUN apk upgrade --no-cache

# Pre-built static assets from the pnpm:build CI job.
COPY dist/ /usr/share/nginx/html/

# Server config — listen 8080, temp paths under /tmp, SPA fallback, /healthz.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Snippet TEMPLATES with the ${API_BACKEND_URL}/${WS_BACKEND_URL} placeholders.
# Kept under a read-only path; the entrypoint renders them into /tmp at startup.
COPY nginx-snippets/ /etc/nginx/templates/snippets/

# Entrypoint renders snippets then starts nginx.
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER 101
EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
