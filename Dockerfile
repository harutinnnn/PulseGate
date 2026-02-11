# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

# Install Git
RUN apk add --no-cache git

WORKDIR /usr/src/app

# Argument for Repo URL (e.g. github.com/username/repo.git)
ARG REPO_URL

# Clone the repository (Public URL version)
RUN git clone https://github.com/harutinnnn/PulseGate.git .

# Install ALL dependencies (needed for building)
RUN npm install

# 1. Build the main project (TS -> JS in /dist)
RUN npm run build

# 2. Compile knexfile.ts -> knexfile.js
# We use --esModuleInterop to fix the "path" module error
RUN npx tsc knexfile.ts --module commonjs --target es2018 --moduleResolution node --skipLibCheck --esModuleInterop

# 3. Compile Migrations (TS -> JS)
# We compile your migrations folder into a temporary folder "migrations_build"
# This ensures we don't copy raw TS files to production
RUN npx tsc migrations/*.ts --outDir migrations_build --module commonjs --target es2018 --moduleResolution node --skipLibCheck --esModuleInterop

# --- Stage 2: Production Stage ---
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY --from=builder /usr/src/app/package*.json ./

# Copy the built application
COPY --from=builder /usr/src/app/dist ./dist

# Copy the compiled knexfile.js
COPY --from=builder /usr/src/app/knexfile.js ./

# Copy the compiled migrations into the 'migrations' folder
# Now your production image has valid JS migration files
COPY --from=builder /usr/src/app/migrations_build ./migrations

# Install ONLY production dependencies
RUN npm install --only=production

# Install knex globally so the 'knex' command works
RUN npm install -g knex

# App Port
ENV PORT=8080
EXPOSE 8080

# Command: Run migrations, then start the app
CMD ["/bin/sh", "-c", "npx knex migrate:latest && node dist/index.js"]