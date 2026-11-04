#!/bin/bash
# =============================================================================
# new-repo.sh
# Create a GitHub repo with the label scheme, description and topics in one go.
# Anything after the flags is passed straight to `gh repo create`.
#
# Usage:
#   bash new-repo.sh <Repo-Name> [--desc "..."] [--topics "a,b,c"] [gh repo create flags]
#
# Examples:
#   bash new-repo.sh Second-Brain --desc "3D memory visualizer" --topics "claude-code,threejs" --public
#   bash new-repo.sh Tiny-Tool --private --source . --push     # from an existing local folder
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib/labels.sh"

if [[ $# -lt 1 || "$1" == -* ]]; then
  sed -n '2,13p' "$0"
  exit 1
fi

NAME="$1"; shift
DESC=""
TOPICS=""
PASSTHRU=()
while [[ $# -gt 0 ]]; do
  case "$1" in
    --desc) DESC="$2"; shift 2 ;;
    --topics) TOPICS="$2"; shift 2 ;;
    *) PASSTHRU+=("$1"); shift ;;
  esac
done

# Default to private unless a visibility flag was given
if [[ ! " ${PASSTHRU[*]} " =~ \ --(public|private|internal)\  ]]; then
  PASSTHRU+=("--private")
fi

require_gh

echo "🚀 Creating $NAME ..."
if [[ -n "$DESC" ]]; then
  gh repo create "$NAME" --description "$DESC" "${PASSTHRU[@]}" || exit 1
else
  gh repo create "$NAME" "${PASSTHRU[@]}" || exit 1
fi

OWNER=$(gh api user -q .login)
if [[ "$NAME" == */* ]]; then REPO="$NAME"; else REPO="$OWNER/$NAME"; fi

if [[ -n "$TOPICS" ]]; then
  IFS=',' read -ra T <<< "$TOPICS"
  args=()
  for t in "${T[@]}"; do args+=(--add-topic "$(echo "$t" | tr -d ' ')"); done
  gh repo edit "$REPO" "${args[@]}" && echo "🏷️  Topics: $TOPICS"
fi

apply_labels "$REPO"
echo ""
echo "✅ $REPO is ready: $(gh repo view "$REPO" --json url -q .url)"
