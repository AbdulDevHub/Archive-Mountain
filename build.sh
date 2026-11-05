#!/usr/bin/env bash
# The full deploy build. Netlify runs this (netlify.toml); the publish dir is the repo root.
# Every sub-project builds in parallel, each with its own log; a failure prints that log and fails the deploy.
set -euo pipefail
# Git Bash on Windows would turn "/projects/x/" into a Windows path; no effect on Linux
export MSYS2_ARG_CONV_EXCL="/projects/" MSYS2_ENV_CONV_EXCL="BASE_PATH;PUBLIC_URL"
cd "$(dirname "$0")"
ROOT="$PWD"
LOGS="$ROOT/.build-logs"
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

# Moved framework apps are served at /projects/<slug>/ through a rewrite to their build output.
# Each one reads BASE_PATH (CRA reads PUBLIC_URL) so its own asset links point there, and
# tools/relocate.mjs fixes the root-absolute public paths ("/images/x.png") left in the code.
# slug|folder|output dir|extra build args
APPS=(
  "job-board|App Valley/Job Board|dist|"
  "angular-webshop|App Valley/Angular Webshop|dist/ecommerce-store|--base-href /projects/angular-webshop/"
  "anime-vault|App Valley/Anime Vault|out|"
  "macbook-homepage|UI Experiments/MacBook Homepage|dist|"
  "gsap-drinks|UI Experiments/GSAP Drinks|dist|"
  "black-hole|UI Experiments/Black Hole|out|"
  "techno-explosion|UI Experiments/Techno Explosion|out|"
  "fancy-green|UI Experiments/Fancy Green|dist|"
  "3d-solar-portfolio|UI Experiments/3D Solar Portfolio|dist|"
  "pay-card|UI Experiments/Pay Card Component|build|"
  "vuetify-image-gallery|UI Experiments/Vuetify Image Gallery|dist|"
  "sky-diving-parallax-cat|Awesome Effects/Sky Diving Parallax Cat|dist|"
)

build_app() {
  local slug dir out args
  IFS="|" read -r slug dir out args <<<"$1"
  # shellcheck disable=SC2086 # args are deliberately split into words
  BASE_PATH="/projects/$slug/" PUBLIC_URL="/projects/$slug" install_and_build "$dir" $args
  node "$ROOT/tools/relocate.mjs" "$ROOT/$dir/$out" "/projects/$slug/"
}

# Write the rewrites for the apps above (Netlify reads _redirects before netlify.toml)
: >"$ROOT/_redirects"
for app in "${APPS[@]}"; do
  IFS="|" read -r slug dir out _ <<<"$app"
  printf '/projects/%s/*  /%s/%s/:splat  200\n' "$slug" "${dir// /%20}" "$out" >>"$ROOT/_redirects"
done

# Every job: "label|command" — run in parallel, JOBS at a time
TASKS=(
  "Bulk File Renamer|install_and_build 'Awesome Websites/Bulk File Renamer'"
  "Gitmoji Helper|install_and_build 'Awesome Websites/Gitmoji-Helper'"
  "Midnight Passages|install_and_build 'Awesome Websites/Midnight Passages'"
  "Flappy Bird|install_and_build 'Awesome Websites/Flappy Bird'"
  "Animated CSS Login Form|install_and_build 'UI Experiments/Animated CSS Login Form'"
  "AI Valley|install_and_build 'AI Valley'"
  "Gallery|install_and_build Gallery"
)
for app in "${APPS[@]}"; do TASKS+=("${app%%|*}|build_app '$app'"); done

# Optional arguments pick tasks by label (e.g. `bash build.sh job-board Gallery`); none builds everything
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
echo "All builds finished successfully!"
