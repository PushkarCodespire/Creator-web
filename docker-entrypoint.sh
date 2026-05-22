#!/bin/sh
# Container entrypoint. Assembles the live nginx config from the
# snippets in /etc/nginx/snippets/ and writes it to /tmp/nginx.conf
# (the only writable mount when the chart runs the image with
# readOnlyRootFilesystem=true).
#
# The pod ALWAYS boots — empty or missing env vars never crash startup.
# If the backend is unreachable at runtime nginx returns 502 per
# request and stays up; recovery is automatic.

set -eu

SNIPPETS=/etc/nginx/snippets
RENDERED=/tmp/nginx.conf

# ---- defaults (only when env unset; explicit empty value is honoured) ----
: "${SERVER_PORT:=8080}"
: "${API_BACKEND_URL:=}"
# WS upstream defaults to the API upstream when not set separately.
: "${WS_BACKEND_URL:=${API_BACKEND_URL}}"

# ---- DNS resolver (parsed from /etc/resolv.conf at start) ----
# Required because proxy_pass uses a variable for lazy DNS resolution
# (so nginx boots even when the backend isn't deployed yet).
DNS_RESOLVER=$(awk '/^nameserver / { print $2; exit }' /etc/resolv.conf 2>/dev/null || true)
: "${DNS_RESOLVER:=1.1.1.1}"

export SERVER_PORT API_BACKEND_URL WS_BACKEND_URL DNS_RESOLVER

# ---- assemble nginx.conf from snippets ----
{
  cat "$SNIPPETS/header.conf"
  if [ -n "${API_BACKEND_URL:-}" ]; then
    envsubst '${DNS_RESOLVER}' < "$SNIPPETS/proxy.conf"
  fi
  envsubst '${SERVER_PORT}' < "$SNIPPETS/server-open.conf"
  if [ -n "${API_BACKEND_URL:-}" ]; then
    envsubst '${API_BACKEND_URL} ${WS_BACKEND_URL}' < "$SNIPPETS/api-proxy.conf"
  fi
  cat "$SNIPPETS/static.conf"
  cat "$SNIPPETS/footer.conf"
} > "$RENDERED"

# Validate the rendered config now so a bad snippet fails fast with a
# clear nginx error instead of a silent exit after CMD. Syntax-only
# check — the variable in proxy_pass defers DNS lookup to request time.
if ! nginx -t -c "$RENDERED" 2>&1; then
  echo "[entrypoint] nginx -t failed; rendered config:" >&2
  cat "$RENDERED" >&2
  exit 1
fi

echo "[entrypoint] booted api=${API_BACKEND_URL:-<none>} ws=${WS_BACKEND_URL:-<none>} resolver=${DNS_RESOLVER}" >&2

exec "$@"
