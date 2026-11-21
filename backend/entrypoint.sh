#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."

python - <<'PY'
import os
import socket
import time

host = os.getenv("DB_HOST", "db")
port = int(os.getenv("DB_PORT", "5432"))

while True:
    try:
        with socket.create_connection((host, port), timeout=2):
            print("PostgreSQL is available.")
            break
    except OSError:
        print("PostgreSQL is not ready. Retrying in 2 seconds...")
        time.sleep(2)
PY

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000