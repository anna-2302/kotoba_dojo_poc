#!/bin/bash

echo "Clearing Vite cache and node_modules cache..."

# Remove .vite directory
rm -rf .vite 2>/dev/null
echo "✓ Cleared .vite cache"

# Remove node_modules .vite cache
rm -rf node_modules/.vite 2>/dev/null
echo "✓ Cleared node_modules/.vite cache"

# Remove Vite temp build info
rm -rf node_modules/.tmp 2>/dev/null
echo "✓ Cleared node_modules/.tmp"

# Clear browser cache indicators
rm -rf .vite-ssg 2>/dev/null
echo "✓ Cleared .vite-ssg"

echo ""
echo "Cache cleared! Start the dev server with: npm run dev"
