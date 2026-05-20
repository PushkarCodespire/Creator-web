#!/bin/sh
set -e

# Substitute runtime env vars into nginx snippets.
# API_BACKEND_URL and WS_BACKEND_URL are injected by the react-vite Helm chart
# and consumed by nginx-snippets/api-proxy.conf at container start.
for f in /etc/nginx/snippets/*.conf; do
    envsubst '${API_BACKEND_URL} ${WS_BACKEND_URL}' < "$f" > "$f.tmp" && mv "$f.tmp" "$f"
done

exec "$@"
