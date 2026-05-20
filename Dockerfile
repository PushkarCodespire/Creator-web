# ===========================================
# PRODUCTION DOCKERFILE - FRONTEND
# ===========================================
# Multi-stage build for optimized production image

# Stage 1: Builder
FROM node:20-alpine AS builder

# Enable corepack so pnpm is available without a separate install step
RUN corepack enable

WORKDIR /app

# Copy lockfile and manifest first for better layer caching
COPY package.json pnpm-lock.yaml pnpm.yaml* ./

# Install dependencies using pnpm (matches CI pipeline)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build production bundle (TypeScript check + Vite build)
RUN pnpm run build

# Stage 2: Production (Nginx)
FROM nginx:alpine

# Install curl for healthcheck and envsubst for runtime env injection
RUN apk add --no-cache curl gettext

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy nginx snippets (API proxy config, env-substituted at container start)
COPY nginx-snippets/ /etc/nginx/snippets/

# Copy entrypoint that substitutes env vars into nginx snippets
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -u 1001 && \
    chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/snippets && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Switch to non-root user
USER nginx-user

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
