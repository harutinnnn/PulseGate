#!/bin/sh

# Run migrations
echo "Running migrations..."
npx knex migrate:latest

# Start the application
echo "Starting application..."
exec "$@"