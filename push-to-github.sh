#!/usr/bin/env bash
#
# push-to-github.sh — create a PRIVATE GitHub repo for OjaX and push everything.
#
#   Usage:
#     1) Create a GitHub token with "repo" scope:
#        https://github.com/settings/tokens/new  (tick: repo)
#     2) bash push-to-github.sh  YOUR_TOKEN  your-gh-username
#        e.g.  bash push-to-github.sh ghp_xxxxxxxxxxxx  olamide
#
# What it does:
#   - initialises git history (if not already) in this folder
#   - creates a PRIVATE repo named "ojax" under your account (via GitHub API)
#   - pushes the full tree including this README, docs/ and the seed photos
#   - prints the repo URL
#
set -euo pipefail

TOKEN="${1:-}"
OWNER="${2:-}"
REPO_NAME="${3:-ojax}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if [[ -z "$TOKEN" || -z "$OWNER" ]]; then
  echo "Usage: bash push-to-github.sh <GITHUB_TOKEN> <GITHUB_USERNAME> [repo-name]"
  echo "Create a token at https://github.com/settings/tokens/new (scope: repo)"
  exit 1
fi

# Local git history (one clean commit per major milestone is fine).
if [[ ! -d .git ]]; then
  echo ">> initialising local git repository…"
  git init -q
  git checkout -q -b main
fi

git config user.name  >/dev/null 2>&1 || git config user.name  "OjaX"
git config user.email >/dev/null 2>&1 || git config user.email "ojax@users.noreply.github.com"

git add -A >/dev/null 2>&1 || true
if git diff --cached --quiet; then
  echo ">> nothing new to commit"
else
  git commit -qm "chore: snapshot $(date +%Y-%m-%d) — OjaX campus market & events platform" || true
fi

echo ">> creating private GitHub repo: ${OWNER}/${REPO_NAME}"
RESP=$(curl -fsS -X POST "https://api.github.com/user/repos" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"name\":\"${REPO_NAME}\",\"private\":true,\"description\":\"OjaX — trusted campus marketplace & events hub for Nigerian university students\",\"has_issues\":true,\"has_wiki\":true}") \
  || true

if [[ -z "${RESP}" ]]; then
  echo ">> repo may already exist — trying to push anyway."
fi

echo ">> pushing to origin/main…"
git remote remove origin >/dev/null 2>&1 || true
git remote add origin "https://x-access-token:${TOKEN}@github.com/${OWNER}/${REPO_NAME}.git"
git push -q -u origin main || git push -q -u origin main --force

echo ""
echo "✅ Done! Your private repo lives at:"
echo "   https://github.com/${OWNER}/${REPO_NAME}"
echo "   Clone it with:  git clone git@github.com:${OWNER}/${REPO_NAME}.git"
echo ""
echo "Tip: keep future pushes simple — 'git push' inside the ojax folder."
