#!/bin/bash
set -e

echo "Installing dependencies..."
yarn install --frozen-lockfile

echo "Building frontend..."
yarn build

echo "Restarting PM2..."
pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
pm2 save

echo "Deploy completed!"
