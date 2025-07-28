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

# Build arguments for API keys and Firebase config
ARG GEMINI_API_KEY
ARG FIREBASE_API_KEY
ARG FIREBASE_AUTH_DOMAIN=astute-buttress-463406-b8.firebaseapp.com
ARG FIREBASE_PROJECT_ID=astute-buttress-463406-b8
ARG FIREBASE_STORAGE_BUCKET=astute-buttress-463406-b8.firebasestorage.app
ARG FIREBASE_MESSAGING_SENDER_ID
ARG FIREBASE_APP_ID

# Set environment variables
ENV VITE_GEMINI_API_KEY=$GEMINI_API_KEY
ENV VITE_FIREBASE_API_KEY=$FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$FIREBASE_APP_ID

# Debug: Verify environment variables are set (show presence for security)
RUN echo "=== API Keys Debug Info ===" && \
    echo "Gemini API key: ${GEMINI_API_KEY:+YES} (length: ${#GEMINI_API_KEY})" && \
    echo "Firebase API key: ${FIREBASE_API_KEY:+YES} (length: ${#FIREBASE_API_KEY})" && \
    echo "=== Environment Variables Debug Info ===" && \
    echo "VITE_GEMINI_API_KEY: ${VITE_GEMINI_API_KEY:+YES} (length: ${#VITE_GEMINI_API_KEY})" && \
    echo "VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY:+YES} (length: ${#VITE_FIREBASE_API_KEY})" && \
    echo "VITE_FIREBASE_PROJECT_ID: ${VITE_FIREBASE_PROJECT_ID}" && \
    echo "VITE_FIREBASE_AUTH_DOMAIN: ${VITE_FIREBASE_AUTH_DOMAIN}" && \
    echo "VITE_FIREBASE_STORAGE_BUCKET: ${VITE_FIREBASE_STORAGE_BUCKET}" && \
    if [ -z "$VITE_GEMINI_API_KEY" ]; then \
        echo "ERROR: VITE_GEMINI_API_KEY is not set!"; \
        exit 1; \
    fi && \
    if [ -z "$VITE_FIREBASE_PROJECT_ID" ]; then \
        echo "ERROR: VITE_FIREBASE_PROJECT_ID is not set!"; \
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
