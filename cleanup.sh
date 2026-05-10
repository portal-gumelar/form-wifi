#!/bin/bash
echo "🧹 Cleaning up ARMEDIA project..."
rm -rf dist
rm -rf node_modules
rm -rf public/data/dummy_data.js
echo "✅ Cleanup complete. Run 'npm install' and 'python3 scripts/build_dashboard.py' to rebuild."
