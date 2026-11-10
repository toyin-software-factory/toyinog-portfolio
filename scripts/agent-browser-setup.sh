#!/usr/bin/env bash
# One-time setup inside an HQ agent sandbox (Debian, passwordless sudo):
# Node 22 LTS, agent-browser (pinned), Chrome for Testing with its system libraries, ffmpeg.
# Safe to re-run; it skips what is already there. Installs last until the sandbox is recreated.
# Usage: bash scripts/agent-browser-setup.sh
set -euo pipefail
AB_VERSION="0.39.4"   # vercel-labs/agent-browser; bump deliberately, in a PR

need() { ! command -v "$1" >/dev/null 2>&1; }

echo "== system packages (curl, xz, ffmpeg)"
if need ffmpeg || need xz || need curl; then
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq --no-install-recommends ca-certificates curl xz-utils ffmpeg >/dev/null
fi

echo "== Node 22 LTS"
if need node || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  case "$(uname -m)" in x86_64) arch=x64 ;; aarch64) arch=arm64 ;; *) echo "unsupported CPU $(uname -m)" >&2; exit 1 ;; esac
  base="https://nodejs.org/dist/latest-v22.x"
  tmp="$(mktemp -d)"
  curl -fsSL "$base/SHASUMS256.txt" -o "$tmp/SHASUMS256.txt"
  file="$(awk -v a="linux-$arch.tar.xz" '$2 ~ a"$" {print $2}' "$tmp/SHASUMS256.txt")"
  curl -fsSL "$base/$file" -o "$tmp/$file"
  (cd "$tmp" && grep " $file\$" SHASUMS256.txt | sha256sum -c - >/dev/null)
  sudo tar -xJf "$tmp/$file" -C /usr/local --strip-components=1 --exclude='*.md' --exclude=LICENSE
  rm -rf "$tmp"
fi
node -v

echo "== agent-browser $AB_VERSION"
if need agent-browser || [ "$(agent-browser --version 2>/dev/null | grep -o '[0-9.]*' | head -1)" != "$AB_VERSION" ]; then
  sudo npm install -g --no-audit --no-fund --loglevel=error "agent-browser@$AB_VERSION" </dev/null
fi
echo "== Chrome for Testing and its libraries"
agent-browser install --with-deps </dev/null

echo "== smoke test"
s="setup-$$"
agent-browser --session "$s" open https://example.com </dev/null >/dev/null
agent-browser --session "$s" screenshot /tmp/agent-browser-setup.png </dev/null >/dev/null
agent-browser --session "$s" record start /tmp/agent-browser-setup.webm https://example.com </dev/null >/dev/null
sleep 2
agent-browser --session "$s" record stop </dev/null >/dev/null
agent-browser --session "$s" close </dev/null >/dev/null || true
ls -la /tmp/agent-browser-setup.png /tmp/agent-browser-setup.webm
echo "agent-browser ready."
