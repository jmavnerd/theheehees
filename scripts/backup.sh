#!/bin/bash
# Snapshot the live Hee Hees state row into backups/ (read-only request).
# Keeps the newest 20 snapshots. backups/ is gitignored: the repo is public and
# the snapshots contain the whole season (names, fees, payments).
set -euo pipefail
DIR="$(cd "$(dirname "$0")/.." && pwd)"
KEY="$(grep -o "SB_KEY = '[^']*" "$DIR/index.html" | cut -d"'" -f2)"
URL="$(grep -o "SB_URL = '[^']*" "$DIR/index.html" | cut -d"'" -f2)"
OUT="$DIR/backups/hh12-backup-$(date +%Y%m%d-%H%M%S).json"
mkdir -p "$DIR/backups"
curl -sf "$URL/rest/v1/hee_hees_state?id=eq.hh12&select=state,updated_at" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -o "$OUT.tmp"
# Refuse to keep an empty / bad snapshot.
python3 -c "import json,sys; d=json.load(open(sys.argv[1])); assert d and d[0]['state']['weeks'] is not None" "$OUT.tmp"
mv "$OUT.tmp" "$OUT"
ls -1t "$DIR"/backups/hh12-backup-*.json | tail -n +21 | xargs -I{} rm -f {}
echo "saved $OUT"
