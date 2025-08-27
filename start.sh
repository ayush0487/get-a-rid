#!/bin/bash

# Set environment variables for production
export NODE_ENV=production
export DEBUG=""

echo "Starting application..."
exec node server.js
