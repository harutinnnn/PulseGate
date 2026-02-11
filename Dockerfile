FROM node:20-alpine AS builder
WORKDIR /build

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Production image
FROM node:20-alpine
WORKDIR /app

# Copy dependencies and built files
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /build/dist ./dist
COPY migrations ./migrations

EXPOSE 8080
ENTRYPOINT ["./entrypoint.sh"]
CMD ["node", "dist/index.js"]