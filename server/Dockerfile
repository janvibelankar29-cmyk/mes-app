# Build Stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci --only=production

# Copy application source code
COPY . .

# -------------------------
# Production Stage
# -------------------------
FROM node:18-alpine

WORKDIR /usr/src/app

# Only copy over the node_modules and src code from the builder stage
COPY --from=builder /usr/src/app ./

# Setup a non-root user for security
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs
USER nodejs

# Expose API port
EXPOSE 5000

# Start application using PM2-like cluster mode natively or standard node index
CMD ["node", "index.js"]
