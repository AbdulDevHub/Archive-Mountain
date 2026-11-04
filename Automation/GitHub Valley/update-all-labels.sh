#!/bin/bash
# =============================================================================
# update-all-labels.sh
# Applies the optimized label scheme across your personal repos.
# - Renames matching GitHub defaults to the new scoped style (no data loss)
# - Deletes "question" (no equivalent in the scheme)
# - Creates / force-updates Status, Type, Priority and Resolution labels
# - Never touches other labels you've created yourself
#
# Usage:
#   bash update-all-labels.sh                  # every non-archived repo
#   bash update-all-labels.sh --since 3        # only repos pushed/created in the last 3 days
#   bash update-all-labels.sh --only-outdated  # skip repos that already match the scheme
#   bash update-all-labels.sh --dry-run        # list what would be updated, change nothing
#   bash update-all-labels.sh --owner SomeOrg  # an org or another account you can admin
#
# Flags combine: the GitHub Action runs `--since 3 --only-outdated` daily.
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib/labels.sh"

SINCE_DAYS=""
ONLY_OUTDATED=false
DRY_RUN=false
OWNER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --since) SINCE_DAYS="$2"; shift 2 ;;
    --only-outdated) ONLY_OUTDATED=true; shift ;;
    --dry-run) DRY_RUN=true; ONLY_OUTDATED=true; shift ;;
    --owner) OWNER="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "❌ Unknown option: $1"; exit 1 ;;
  esac
done

require_gh

# Build the jq filter: optionally keep only repos pushed after a cutoff date.
filter='.[]'
if [[ -n "$SINCE_DAYS" ]]; then
  if ! [[ "$SINCE_DAYS" =~ ^[0-9]+$ ]]; then
    echo "❌ --since expects a number of days"; exit 1
  fi
  cutoff=$(date -u -d "-${SINCE_DAYS} days" +%Y-%m-%dT%H:%M:%SZ 2>/dev/null \
        || date -u -v-"${SINCE_DAYS}"d +%Y-%m-%dT%H:%M:%SZ)   # GNU date, then BSD/macOS
  filter=".[] | select(.pushedAt >= \"$cutoff\")"
  echo "🕒 Only repos pushed since $cutoff"
fi

echo "🔍 Fetching your repositories..."
# shellcheck disable=SC2086
if ! repo_list=$(gh repo list $OWNER --limit 200 --no-archived --source \
  --json nameWithOwner,pushedAt -q "$filter | .nameWithOwner"); then
  echo "❌ Could not list repositories (check gh auth / token permissions)."
  exit 1
fi
repos=()
while IFS= read -r line; do
  line="${line%$'\r'}"
  [[ -n "$line" ]] && repos+=("$line")
done <<< "$repo_list"

if [[ ${#repos[@]} -eq 0 ]]; then
  echo "📭 No matching repositories."
  exit 0
fi
echo "📋 Found ${#repos[@]} repositories."

updated=0
skipped=0
for repo in "${repos[@]}"; do
  [[ -z "$repo" ]] && continue
  if $ONLY_OUTDATED && labels_ok "$repo"; then
    skipped=$((skipped + 1))
    continue
  fi
  if $DRY_RUN; then
    echo "  • would update: $repo"
  else
    apply_labels "$repo"
  fi
  updated=$((updated + 1))
done

echo ""
if $DRY_RUN; then
  echo "🧪 Dry run: $updated repo(s) need updating, $skipped already match."
else
  echo "🎉 Updated $updated repo(s), $skipped already matched the scheme."
fi
