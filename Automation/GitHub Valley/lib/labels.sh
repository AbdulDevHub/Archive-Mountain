#!/bin/bash
# =============================================================================
# lib/labels.sh
# Shared label scheme + helpers, sourced by init-labels.sh, update-all-labels.sh
# and new-repo.sh. Edit the scheme HERE and every script picks it up.
#
# Scheme reference: https://dev-mountain.vercel.app/resources/tools-workflow/github-label-setup
# =============================================================================

# ── Renames: GitHub default → scoped name (keeps every tagged issue) ─────────
RENAME_OLDS=("bug" "documentation" "enhancement" "good first issue" "help wanted" "duplicate" "invalid" "wontfix")
RENAME_NEWS=("Type: Bug" "Type: Documentation" "Type: Enhancement" "Good First Issue" "Help Wanted" "Resolution: Duplicate" "Resolution: Invalid" "Resolution: Wontfix")
RENAME_COLORS=("D93F0B" "006B75" "BFD4F2" "702D95" "0052CC" "CFD3D7" "CFD3D7" "CFD3D7")
RENAME_DESCS=(
  "Something isn't working or throwing errors."
  "Improvements or additions to docs, READMEs, or guides."
  "Improving existing code, performance, or UI."
  "Approachable tasks specifically curated for newcomers."
  "Core team needs extra context or external code support."
  "This issue or pull request already exists elsewhere."
  "The issue is unreproducible, spam, or out of scope."
  "Valid issue, but consciously decided not to pursue."
)

# ── New labels to create ──────────────────────────────────────────────────────
NEW_NAMES=("Status: Todo" "Status: In Progress" "Status: On Hold" "Status: In Review" "Status: Done" "Type: Feature" "Type: Maintenance" "Priority: Critical" "Priority: High" "Priority: Medium" "Priority: Low")
NEW_COLORS=("D4C5F9" "FBCA04" "E6E6E6" "1D76DB" "0E8A16" "A2EEEF" "F9D0C4" "B60205" "E11D21" "FBCA04" "C5DEF5")
NEW_DESCS=(
  "Work that is ready to be assigned or started."
  "Active development or investigation has begun."
  "Work is temporarily blocked or waiting on external factors."
  "Changes are submitted or code review is ongoing."
  "Work is successfully completed and merged."
  "New features, modules, or functional requests."
  "Chores, refactoring, dependencies, or package updates."
  "Main branch broken, security flaw, blocking all progress."
  "High-impact issue that needs immediate attention."
  "Standard priority task for the current milestone."
  "Low impact, minor annoyance, or nice-to-have."
)

# Labels with no equivalent in the scheme (deleted if present)
DELETE_NAMES=("question")

# ── Helper: exact line match (pure bash, no grep pipe) ───────────────────────
# Usage: has_line "$multiline_list" "needle"          # case-insensitive
#        has_line "$multiline_list" "needle" exact    # case-sensitive
# Whole-line match, so "bug" doesn't match an already-renamed "Type: Bug".
has_line() {
  local needle="$2" line cr=$'\r'
  [[ "$3" == "exact" ]] || needle="${needle,,}"
  while IFS= read -r line; do
    line="${line%"$cr"}"
    [[ "$3" == "exact" ]] || line="${line,,}"
    [[ "$line" == "$needle" ]] && return 0
  done <<< "$1"
  return 1
}

# ── Helper: does a repo already match the scheme? ────────────────────────────
# Fetches name|color|description once; returns 0 if nothing needs changing.
labels_ok() {
  local repo="$1" current i expected
  current=$(gh label list --repo "$repo" --limit 200 \
    --json name,color,description -q '.[] | "\(.name)|\(.color)|\(.description)"' 2>/dev/null) || return 1

  local names="" line
  while IFS= read -r line; do names+="${line%%|*}"$'\n'; done <<< "$current"

  for i in "${!RENAME_OLDS[@]}"; do
    has_line "$names" "${RENAME_OLDS[$i]}" exact && return 1
    expected="${RENAME_NEWS[$i]}|${RENAME_COLORS[$i]}|${RENAME_DESCS[$i]}"
    has_line "$current" "$expected" || return 1
  done
  for i in "${!NEW_NAMES[@]}"; do
    expected="${NEW_NAMES[$i]}|${NEW_COLORS[$i]}|${NEW_DESCS[$i]}"
    has_line "$current" "$expected" || return 1
  done
  for i in "${!DELETE_NAMES[@]}"; do
    has_line "$names" "${DELETE_NAMES[$i]}" && return 1
  done
  return 0
}

# ── Apply the scheme to one repo (idempotent) ────────────────────────────────
apply_labels() {
  local repo="$1" existing i

  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Processing: $repo"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  if ! existing=$(gh label list --repo "$repo" --limit 200 --json name -q '.[].name' 2>&1); then
    echo "  ❌ Could not read labels: $existing"
    return 1
  fi

  # 1. Delete labels with no equivalent in the new scheme
  for i in "${!DELETE_NAMES[@]}"; do
    if has_line "$existing" "${DELETE_NAMES[$i]}"; then
      echo "  🗑️  Deleting \"${DELETE_NAMES[$i]}\""
      gh label delete "${DELETE_NAMES[$i]}" --repo "$repo" --yes >/dev/null 2>&1 || true
    fi
  done

  # 2. Rename matching defaults (skip if the new name already exists)
  for i in "${!RENAME_OLDS[@]}"; do
    local old="${RENAME_OLDS[$i]}" new="${RENAME_NEWS[$i]}"
    # Rename when the old default exists and the new name isn't there yet (exact case,
    # so "good first issue" → "Good First Issue" is a rename, not a duplicate).
    if has_line "$existing" "$old" && ! has_line "$existing" "$new" exact; then
      echo "  ✏️  Renaming \"$old\" → \"$new\""
      gh label edit "$old" --name "$new" \
        --color "${RENAME_COLORS[$i]}" --description "${RENAME_DESCS[$i]}" \
        --repo "$repo" >/dev/null 2>&1 || echo "  ⚠️  Could not rename \"$old\" (skipping)"
    else
      # Make sure the scoped label exists with the right color/description
      gh label create "$new" --color "${RENAME_COLORS[$i]}" --description "${RENAME_DESCS[$i]}" \
        --repo "$repo" --force >/dev/null 2>&1 || true
    fi
  done

  # 3. Create / force-update new labels
  for i in "${!NEW_NAMES[@]}"; do
    echo "  ➕ Ensuring \"${NEW_NAMES[$i]}\""
    gh label create "${NEW_NAMES[$i]}" --color "${NEW_COLORS[$i]}" --description "${NEW_DESCS[$i]}" \
      --repo "$repo" --force >/dev/null 2>&1 || echo "  ⚠️  Could not create \"${NEW_NAMES[$i]}\""
  done

  echo "  ✅ Done."
}

# ── Preflight: gh installed and authenticated ────────────────────────────────
require_gh() {
  if ! command -v gh >/dev/null 2>&1; then
    echo "❌ GitHub CLI (gh) not found. Install it: https://cli.github.com/"
    exit 1
  fi
  if ! gh auth status >/dev/null 2>&1; then
    echo "❌ gh is not authenticated. Run: gh auth login   (or set GH_TOKEN)"
    exit 1
  fi
}
