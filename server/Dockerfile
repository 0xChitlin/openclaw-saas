FROM node:20-slim AS builder

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Install all dependencies (including devDependencies for tsc)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Production stage
FROM node:20-slim

WORKDIR /app

# Install build tools for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=builder /app/dist ./dist

# Copy schema to dist
COPY src/db/schema.sql ./dist/db/schema.sql

# Create data directory
RUN mkdir -p data

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]
