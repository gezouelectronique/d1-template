#!/usr/bin/env bash
# Construit le dossier « CARRIERE HUMANITAIRE NIGER » prêt à être envoyé sur un VPS.
# Usage : bash vps/preparer-dossier.sh [dossier_de_sortie]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="${1:-build}/CARRIERE HUMANITAIRE NIGER"
rm -rf "$OUT"
mkdir -p "$OUT/site" "$OUT/documents" "$OUT/code-source"

npx esbuild vps/server.ts --bundle --platform=node --format=esm --target=node22 --outfile=dist/server.mjs --log-level=warning
cp -r dist migrations public "$OUT/site/"
cp vps/install.sh vps/configuration.env "$OUT/site/"
cp vps/INSTALLER-SUR-VPS.bat vps/envoyer-sur-vps.ps1 vps/envoyer-sur-vps.sh vps/LISEZ-MOI.md "$OUT/"
cp docs/STRATEGIE.md docs/CALENDRIER-30-JOURS.md "$OUT/documents/"
git archive --format=tar HEAD | tar -x -C "$OUT/code-source"

# PDF des e-books (nécessite Playwright + Chromium)
if node -e "require('playwright')" 2>/dev/null; then
  TMP="$(mktemp -d)"
  cp -r dist migrations public "$TMP/"
  APP_DIR="$TMP" PORT=3377 SITE_URL=http://localhost:3377 node --no-warnings "$TMP/dist/server.mjs" </dev/null >/dev/null 2>&1 &
  SERVER_PID=$!
  sleep 2
  node vps/pdf.cjs "$TMP" "$OUT/documents" || true
  kill "$SERVER_PID" 2>/dev/null || true
  rm -rf "$TMP"
fi
echo "Dossier prêt : $OUT"
