#!/bin/bash
# =============================================================================
# init-labels.sh
# Applies the optimized label scheme to a SINGLE repository.
# Run this whenever you create a new repo (or use new-repo.sh, which does it for you).
#
# Usage:   bash init-labels.sh <owner/repo>
# Example: bash init-labels.sh AbdulDevHub/my-new-project
# =============================================================================

source "$(dirname "${BASH_SOURCE[0]}")/lib/labels.sh"

if [[ $# -ne 1 ]]; then
  echo "❌ Usage: bash init-labels.sh <owner/repo>"
  echo "   Example: bash init-labels.sh AbdulDevHub/my-new-project"
  exit 1
fi

REPO="$1"
require_gh

if ! gh repo view "$REPO" >/dev/null 2>&1; then
  echo "❌ Repository \"$REPO\" not found or you don't have access."
  exit 1
fi

apply_labels "$REPO"
echo ""
echo "✅ Labels initialized for $REPO!"
