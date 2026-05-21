# -------------------------
# Build Stage
# -------------------------
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Build the Vite application for production
RUN npm run build

# -------------------------
# Production Stage (Nginx)
# -------------------------
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (handles React Router and API proxying)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
