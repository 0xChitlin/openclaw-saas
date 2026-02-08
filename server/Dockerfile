FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy source and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

# Copy schema to dist
RUN mkdir -p dist/db && cp src/db/schema.sql dist/db/schema.sql

# Create data directory
RUN mkdir -p data

# Environment
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]
