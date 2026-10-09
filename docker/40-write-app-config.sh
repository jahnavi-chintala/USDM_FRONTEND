#!/bin/sh
# Writes the runtime configuration read by the app (src/config/env.ts) from environment
# variables, so the same image can point at any backend without a rebuild.
set -eu

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

cat > /usr/share/nginx/html/config.js <<CONFIG
window.__APP_CONFIG__ = {
  convertApiUrl: "$(json_escape "${CONVERT_API_URL:-}")",
  reviewApiUrl: "$(json_escape "${REVIEW_API_URL:-}")"
};
CONFIG

echo "app config: convertApiUrl=${CONVERT_API_URL:-<default>} reviewApiUrl=${REVIEW_API_URL:-<default>}"
