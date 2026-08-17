#!/usr/bin/env bash
set -euo pipefail

repo_dir="/home/enjoy/Documents/Codex/2026-08-16/ska/work/habit-wallpaper"
cd "$repo_dir"
node export-obsidian.mjs "/home/enjoy/Documents/Obsidian Vault/Journal"
git add habits-data.js
if git diff --cached --quiet; then
  exit 0
fi
git commit -m "Update habits from Obsidian"
git push
