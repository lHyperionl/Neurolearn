#!/bin/sh
set -e

# Run migrations and seed data
python -m backend.import_participants || echo "Seeding failed or already seeded"

# Start the server
exec uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
