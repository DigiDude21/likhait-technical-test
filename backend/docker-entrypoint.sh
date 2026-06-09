#!/bin/sh
set -e

# Remove any existing PID file
rm -f /rails/tmp/pids/server.pid

# Wait for database to be ready
echo "Waiting for database..."
while ! nc -z db 3306; do
  sleep 1
done
echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
bundle exec rails db:migrate

# Start the server
exec bundle exec rails server -b 0.0.0.0
