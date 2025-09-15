# Multi-stage build for Next Gen Bitaxe Dashboard
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY src/frontend/package*.json ./
RUN npm ci

# Copy frontend source code
COPY src/frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Setup backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy main package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY src/backend/ ./src/backend/

# Stage 3: Production image
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

WORKDIR /app

# Copy backend files and dependencies
COPY --from=backend-builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=backend-builder --chown=appuser:appuser /app/src ./src
COPY --from=backend-builder --chown=appuser:appuser /app/package*.json ./

# Copy built frontend
COPY --from=frontend-builder --chown=appuser:appuser /app/frontend/dist ./public

# Create config directory with proper permissions
RUN mkdir -p /app/config && \
    chown -R appuser:appuser /app/config

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/config', (res) => { \
        if (res.statusCode === 200 || res.statusCode === 404) { \
            process.exit(0); \
        } else { \
            process.exit(1); \
        } \
    }).on('error', () => process.exit(1))"

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Start application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/backend/server.js"]