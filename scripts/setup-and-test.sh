#!/bin/bash
# One-time local setup and full check for macOS / Linux.
# Usage (from the project folder):  bash scripts/setup-and-test.sh
# Everything it prints is also saved to .runtime/setup-log.txt.
# It installs nothing outside this folder and needs no npm login.
cd "$(dirname "$0")/.." || exit 1
mkdir -p .runtime
LOG=.runtime/setup-log.txt
exec > >(tee "$LOG") 2>&1
echo "== 职镜 setup and test, $(date)"
echo "== system: $(uname -sm)"

if ! command -v node >/dev/null 2>&1; then
  echo "!! Node.js is not installed."
  echo "   Install Node.js 24 (LTS) from https://nodejs.org/ (macOS installer .pkg), or with Homebrew: brew install node@24"
  echo "   Then open a new Terminal window and run this script again."
  exit 1
fi
NODE_VERSION=$(node -p 'process.versions.node')
echo "== node $NODE_VERSION at $(command -v node)"
if ! node -e 'const [a,b]=process.versions.node.split(".").map(Number); process.exit(a>24||(a===24&&b>=9)?0:1)'; then
  echo "!! This project needs Node.js 24.9.0 or newer (found $NODE_VERSION)."
  echo "   Install Node.js 24 (LTS) from https://nodejs.org/, or with Homebrew: brew install node@24"
  exit 1
fi

# pnpm: use one already installed, else run it through corepack or npm exec without a global install.
if command -v pnpm >/dev/null 2>&1; then PNPM=(pnpm)
elif command -v corepack >/dev/null 2>&1 && corepack pnpm@11 --version >/dev/null 2>&1; then PNPM=(corepack pnpm@11)
else PNPM=(npm exec --yes pnpm@11 --)
fi
echo "== pnpm $("${PNPM[@]}" --version 2>&1 | tail -1) via: ${PNPM[*]}"

step() { echo; echo "== $1"; shift; "$@"; local code=$?; echo "== exit $code"; return $code; }
step "install dependencies" "${PNPM[@]}" install --frozen-lockfile || { echo "!! install failed; see the lines above"; exit 1; }
step "verify bundled fonts" node scripts/fetch-font.mjs --verify-only
step "build" "${PNPM[@]}" run build || { echo "!! build failed; see the lines above"; exit 1; }
step "tests" node --test test/*.test.js
TESTS=$?
step "package audit" node scripts/audit-package.mjs
step "build the preview" node scripts/preview/build.mjs
if [ $TESTS -eq 0 ]; then
  mkdir -p release
  step "pack the plugin" "${PNPM[@]}" pack --pack-destination ./release && echo "== plugin package: $(ls -t "$PWD"/release/*.tgz | head -1)"
fi
echo
if [ $TESTS -eq 0 ]; then echo "== done: all tests passed"; else echo "== done: some tests failed (see above)"; fi
echo "== log saved to $LOG"
