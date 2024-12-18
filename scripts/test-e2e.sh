#!/bin/bash

# Set environment variables
export NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="test-maps-key"
export NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET="test-preset"
export NEXT_PUBLIC_BASE_URL="http://localhost:3000"
export DATABASE_URL="file:./.next/test.db"
export TURSO_DATABASE_URL="file:./.next/test.db"
export TURSO_DATABASE_TOKEN="test-token"
export NODE_ENV="test"
export NEXTAUTH_SECRET="test-secret"
export NEXTAUTH_URL="http://localhost:3000"
export GOOGLE_CLIENT_ID="mock-client-id"
export GOOGLE_CLIENT_SECRET="mock-client-secret"
export AUTH_TOKEN="test-auth-token"
export IG_USERNAME="test-ig-user"
export IG_PASSWORD="test-ig-pass"

# Setup database and build
echo "🔄 Setting up test environment..."
./scripts/test-setup.sh

# Run the tests
echo "🧪 Running e2e tests..."
npm run test:e2e 