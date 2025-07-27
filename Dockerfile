# Multi-stage build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Install dependencies
RUN npm cache clean --force && \
    npm install

# Copy source code
COPY . .

# Build argument for API key
ARG GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY

# Debug: Verify API key is set (show length for security)
RUN echo "API key argument received: ${GEMINI_API_KEY:+YES} (length: ${#GEMINI_API_KEY})" && \
    echo "Environment variable set: ${VITE_GEMINI_API_KEY:+YES} (length: ${#VITE_GEMINI_API_KEY})" && \
    if [ -z "$VITE_GEMINI_API_KEY" ]; then \
        echo "ERROR: VITE_GEMINI_API_KEY is not set!"; \
        exit 1; \
    fi

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
