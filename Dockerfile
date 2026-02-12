# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Install git
RUN apk add --no-cache git

# Set working directory
WORKDIR /usr/src/app

# Clone the Git repository
RUN git clone  https://github.com/harutinnnn/PulseGate.git .

# Install dependencies
RUN npm install

# Run migrations
RUN npm run migrate

# Build the project
RUN npm run build

# --- Stage 2: Runtime Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy built files from builder
COPY --from=builder /usr/src/app /usr/src/app

# Expose port (adjust if needed)
EXPOSE 8080

# Start the app
CMD ["npm", "start"]
