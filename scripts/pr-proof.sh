#!/usr/bin/env bash
# Publish proof files (screenshots, videos) for a PR and print the Markdown to paste into its "Proof" section.
# Files go to the repo's `pr-assets` branch under <TASK-ID>/, never into the PR's own diff.
# Videos (.webm/.mp4) also get a GIF preview so they play inline on GitHub.
# Usage: bash scripts/pr-proof.sh <TASK-ID> <file>...
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: $0 <TASK-ID> <file>..." >&2; exit 2; }
id="$1"; shift
case "$id" in *[!A-Za-z0-9._-]*|"") echo "TASK-ID may only use letters, digits, . _ -" >&2; exit 2 ;; esac
for f in "$@"; do [ -f "$f" ] || { echo "no such file: $f" >&2; exit 2; }; done

url="$(git config --get remote.origin.url)"
slug="$(printf '%s' "$url" | sed -E 's#^(https://[^/]+/|git@[^:]+:)##; s#\.git$##')"
root="$(git rev-parse --show-toplevel)"
tree="$(mktemp -d)"
trap 'git -C "$root" worktree remove --force "$tree" >/dev/null 2>&1 || rm -rf "$tree"; git -C "$root" branch -D pr-assets >/dev/null 2>&1 || true' EXIT

if git -C "$root" ls-remote --exit-code --heads origin pr-assets >/dev/null 2>&1; then
  git -C "$root" fetch -q origin pr-assets
  git -C "$root" worktree add -q --detach "$tree" FETCH_HEAD
else
  git -C "$root" worktree add -q --detach "$tree"
  git -C "$tree" checkout -q --orphan pr-assets
  git -C "$tree" rm -rfq --ignore-unmatch . >/dev/null
  printf '# pr-assets\n\nProof screenshots and videos for PRs, one folder per task. Not part of the app.\n' > "$tree/README.md"
fi

mkdir -p "$tree/$id"
md=""
raw="https://raw.githubusercontent.com/$slug/pr-assets/$id"
blob="https://github.com/$slug/blob/pr-assets/$id"
for f in "$@"; do
  name="$(basename "$f")"
  cp "$f" "$tree/$id/$name"
  case "${name,,}" in
    *.webm|*.mp4|*.mov)
      gif="${name%.*}.gif"
      ffmpeg -loglevel error -y -i "$f" -vf "fps=8,scale=800:-1:flags=lanczos" -loop 0 "$tree/$id/$gif"
      md+="![${name%.*}]($raw/$gif)"$'\n'"[Full video: $name]($blob/$name)"$'\n\n' ;;
    *) md+="![${name%.*}]($raw/$name)"$'\n\n' ;;
  esac
done

git -C "$tree" add -A
git -C "$tree" commit -qm "proof: $id"
for try in 1 2 3; do
  git -C "$tree" push -q origin HEAD:refs/heads/pr-assets && break
  [ "$try" = 3 ] && { echo "push to pr-assets failed" >&2; exit 1; }
  git -C "$tree" fetch -q origin pr-assets && git -C "$tree" rebase -q FETCH_HEAD
done
printf '%s' "$md"
