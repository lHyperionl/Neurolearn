#!/bin/sh
set -eu

cd /app

# Ensure db subdirectory exists inside the data volume
mkdir -p /app/data/db

# Run migrations and seed data
python -m import_participants || echo "Seeding failed or already seeded"

# Start the server
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
