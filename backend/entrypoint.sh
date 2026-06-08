#!/bin/sh
set -eu

cd /app

# Ensure db subdirectory exists inside the data volume
mkdir -p /app/data/db

# Download demo NIfTI cases on first start (only if not already present)
if [ ! -d "/app/data/sub-50004" ]; then
    echo "Downloading demo cases from GitHub Releases..."
    wget -q "https://github.com/lHyperionl/Neurolearn/releases/download/v1.0-demo-data/demo-cases.zip" -O /tmp/demo-cases.zip
    unzip -q /tmp/demo-cases.zip -d /app/data
    rm /tmp/demo-cases.zip
    echo "Demo cases ready."
fi

# Run migrations and seed data
python -m import_participants || echo "Seeding failed or already seeded"

# Start the server
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
