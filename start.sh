#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Branch aktualisieren ==="
git pull origin "$(git branch --show-current)"

echo ""
echo "=== Alte Container herunterfahren ==="
docker compose down --remove-orphans 2>/dev/null || true

echo ""
echo "=== Prüfe ob Ports 8080/4200 frei sind ==="
for PORT in 8080 4200; do
    PID=$(lsof -ti ":$PORT" 2>/dev/null || true)
    if [ -n "$PID" ]; then
        PROC=$(ps -p "$PID" -o comm= 2>/dev/null || echo "unbekannt")
        echo "WARNUNG: Port $PORT ist belegt durch $PROC (PID $PID)"
        read -p "Prozess beenden? (j/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[jJyY]$ ]]; then
            kill "$PID" 2>/dev/null || true
            sleep 1
            echo "Prozess $PID beendet."
        else
            echo "Abbruch. Bitte Port $PORT manuell freigeben."
            exit 1
        fi
    fi
done

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
