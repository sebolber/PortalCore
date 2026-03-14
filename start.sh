#!/bin/bash
set -e

echo "=== Branch aktualisieren ==="
git pull origin "$(git branch --show-current)"

echo ""
echo "=== Docker Container neu bauen und starten ==="
docker compose up --build -d

echo ""
echo "=== Fertig ==="
echo "Frontend: http://localhost:4200"
echo "Backend:  http://localhost:8080"
echo ""
echo "=== Logs ==="
docker compose logs -f
