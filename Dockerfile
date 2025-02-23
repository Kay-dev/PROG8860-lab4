# Build stage
FROM node:20.11-slim AS builder
WORKDIR /usr/src/app
# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci
# Copy source
COPY . .
# Run tests
RUN npm test


# Production stage
FROM node:20.11-slim
# Create app directory and set permissions
WORKDIR /usr/src/app
# Create non-root user
RUN groupadd -r appuser && \
    useradd -r -g appuser -s /bin/false appuser && \
    chown -R appuser:appuser /usr/src/app

# Copy only production files from builder
COPY --from=builder --chown=appuser:appuser /usr/src/app/package*.json ./
COPY --from=builder --chown=appuser:appuser /usr/src/app/server.js ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Switch to non-root user
USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
