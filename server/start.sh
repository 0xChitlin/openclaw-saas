#!/bin/bash
set -e

echo "🚀 Starting DeskAgents Server..."

# Create data directory if it doesn't exist
mkdir -p data

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Check if dist exists
if [ ! -d "dist" ]; then
  echo "🔨 Building..."
  npm run build
fi

# Copy schema.sql to dist (needed at runtime)
mkdir -p dist/db
cp src/db/schema.sql dist/db/schema.sql

echo "✅ Starting server..."
node dist/index.js
