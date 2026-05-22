#!/bin/sh
set -e

# Render the api-proxy snippets with ${API_BACKEND_URL} and
# ${WS_BACKEND_URL} substituted at container startup. Output goes to
# /tmp (the only writable path under readOnlyRootFilesystem=true) —
# nginx's default.conf has `include /tmp/nginx-snippets/*.conf;`.
mkdir -p /tmp/nginx-snippets
for f in /etc/nginx/templates/snippets/*.conf; do
    [ -f "$f" ] || continue
    envsubst '${API_BACKEND_URL} ${WS_BACKEND_URL}' < "$f" \
        > "/tmp/nginx-snippets/$(basename "$f")"
done

exec nginx -g "daemon off;"
