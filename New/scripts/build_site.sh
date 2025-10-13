#!/usr/bin/env bash
set -euo pipefail
echo '[placeholder] Generating New/public (replace with real generator)'
mkdir -p New/public
rsync -a --delete New/site/templates/ New/public/ || true
echo 'Done.'
