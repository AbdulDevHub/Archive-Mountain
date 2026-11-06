#!/usr/bin/env bash
# The full deploy build. Netlify runs this (netlify.toml) and publishes _site/.
# Every sub-project builds in parallel, each with its own log; a failure prints that log and fails the deploy.
# Then Gallery/tools/assemble-site.mjs copies only what the gallery shows into _site/.
set -euo pipefail
# Git Bash on Windows would turn "/projects/x/" into a Windows path; no effect on Linux
export MSYS2_ARG_CONV_EXCL="/projects/" MSYS2_ENV_CONV_EXCL="BASE_PATH;PUBLIC_URL"
cd "$(dirname "$0")"
ROOT="$PWD"
LOGS="$ROOT/.build-logs"
SITE="$ROOT/_site"
JOBS="${BUILD_JOBS:-4}"
rm -rf "$LOGS" && mkdir -p "$LOGS"

# Install with the project's own package manager, then run its build script.
# Usage: install_and_build <folder> [extra build args...]
install_and_build() {
  local dir="$1"
  shift
  cd "$ROOT/$dir"
  if [ -f pnpm-lock.yaml ]; then
    pnpm install --frozen-lockfile
    pnpm run build "$@"
  else
    if [ -f package-lock.json ]; then npm ci; else npm install; fi
    npm run build -- "$@"
  fi
}

# Framework apps are served at /projects/<slug>/. Each one reads BASE_PATH (CRA reads PUBLIC_URL)
# so its own asset links point there, and Gallery/tools/relocate.mjs fixes the root-absolute
# public paths ("/images/x.png") left in the code.
# slug|folder|output dir|extra build args
APPS=(
  "ai-toolkit|AI/AI Toolkit|apps|"
  "anime-vault|Web Apps/Anime Vault|out|"
  "apple-homepage|Designs/Apple Homepage|dist|"
  "gsap-drinks|Designs/GSAP Drinks|dist|"
  "black-hole|Designs/Black Hole|out|"
  "techno-explosion|Designs/Techno Explosion|out|"
  "fancy-green|Designs/Fancy Green|dist|"
  "3d-solar-portfolio|Designs/3D Solar Portfolio|dist|"
  "pay-card|Designs/Pay Card Component|build|"
  "sky-diving-parallax-cat|Effects/Sky Diving Parallax Cat|dist|"
)

build_app() {
  local slug dir out args
  IFS="|" read -r slug dir out args <<<"$1"
  # CI=false: Netlify sets CI=true, which makes Create React App (Pay Card) fail on lint warnings
  # shellcheck disable=SC2086 # args are deliberately split into words
  CI=false BASE_PATH="/projects/$slug/" PUBLIC_URL="/projects/$slug" install_and_build "$dir" $args
  node "$ROOT/Gallery/tools/relocate.mjs" "$ROOT/$dir/$out" "/projects/$slug/"
}

# Every job: "label|command" — run in parallel, JOBS at a time
TASKS=(
  "Bulk File Renamer|install_and_build 'Websites/Bulk File Renamer'"
  "Gitmoji Helper|install_and_build 'Websites/Gitmoji-Helper'"
  "Midnight Passages|install_and_build 'Websites/Midnight Passages'"
  "Flappy Bird|install_and_build 'Websites/Flappy Bird'"
  "Gallery|install_and_build Gallery"
)
for app in "${APPS[@]}"; do TASKS+=("${app%%|*}|build_app '$app'"); done

# Optional arguments pick tasks by label (e.g. `bash build.sh anime-vault Gallery`); none builds everything
if [ "$#" -gt 0 ]; then
  picked=()
  for task in "${TASKS[@]}"; do
    for want in "$@"; do [ "${task%%|*}" = "$want" ] && picked+=("$task"); done
  done
  TASKS=("${picked[@]}")
fi

# Each job records its own exit code, so a failure is never lost to `wait -n` reaping it first
for task in "${TASKS[@]}"; do
  while [ "$(jobs -rp | wc -l)" -ge "$JOBS" ]; do wait -n || true; done
  label="${task%%|*}"
  cmd="${task#*|}"
  echo "Building $label..."
  (
    # The inner subshell keeps `set -e`; the wrapper must not die before saving the status
    set +e
    (set -e; eval "$cmd") >"$LOGS/$label.log" 2>&1
    echo "$?" >"$LOGS/$label.status"
  ) &
done
wait

failed=0
for task in "${TASKS[@]}"; do
  label="${task%%|*}"
  if [ "$(cat "$LOGS/$label.status" 2>/dev/null)" != "0" ]; then
    echo "::: $label FAILED, log follows :::"
    cat "$LOGS/$label.log"
    failed=1
  fi
done
[ "$failed" -eq 0 ] || exit 1

# Partial builds (task arguments) stop here; only a full build assembles the site
[ "$#" -eq 0 ] || { echo "Built: $*"; exit 0; }

node "$ROOT/Gallery/tools/assemble-site.mjs" "$ROOT" "$SITE"
for app in "${APPS[@]}"; do
  IFS="|" read -r slug dir out _ <<<"$app"
  mkdir -p "$SITE/projects"
  cp -r "$ROOT/$dir/$out" "$SITE/projects/$slug"
done
echo "All builds finished; _site/ is ready."
