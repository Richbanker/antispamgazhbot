# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Development stage
FROM base AS development
RUN npm ci --include=dev
COPY . .
CMD ["dumb-init", "npm", "run", "dev"]

# Build stage
FROM base AS build
RUN npm ci --include=dev
COPY . .
RUN npm run build

# Production stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./
COPY --chown=nodejs:nodejs .env.example ./

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Copy PM2 config
COPY --chown=nodejs:nodejs ecosystem.config.js ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check')" || exit 1

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Default command
CMD ["node", "dist/index.js"] 