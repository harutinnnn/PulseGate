# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Install Git
RUN apk add --no-cache git

WORKDIR /usr/src/app

# Clone the repository
# (We use a cache-busting ARG here so you can force updates if needed later)
ARG CACHEBUST=1
RUN git clone https://github.com/harutinnnn/PulseGate.git .

# Install dependencies
RUN npm install

# 1. Build the main project
RUN npm run build

# 2. Compile knexfile.ts -> knexfile.js
RUN npx tsc knexfile.ts --module commonjs --target es2018 --moduleResolution node --skipLibCheck --esModuleInterop

# 3. Compile Migrations
RUN npx tsc migrations/*.ts --outDir migrations_build --module commonjs --target es2018 --moduleResolution node --skipLibCheck --esModuleInterop

# --- Stage 2: Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json
COPY --from=builder /usr/src/app/package*.json ./

# Copy built artifacts
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/knexfile.js ./
COPY --from=builder /usr/src/app/migrations_build ./migrations

# Install production dependencies
RUN npm install --only=production
RUN npm install -g knex

# Create a data directory (useful for volumes)
RUN mkdir -p /usr/src/app/data

ENV PORT=8080
EXPOSE 8080

CMD ["/bin/sh", "-c", "npx knex migrate:latest && node dist/index.js"]