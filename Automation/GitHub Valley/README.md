# GitHub Valley: Scoped Issue Labels for Every Repo

A consistent, scoped label scheme for all personal GitHub repos, applied with the [GitHub CLI](https://cli.github.com/). Personal accounts can't set default labels (only Organizations can), so these scripts fill that gap. Full reference and reasoning: [GitHub Label Setup](https://dev-mountain.vercel.app/resources/tools-workflow/github-label-setup).

| Group | Labels |
| --- | --- |
| Status | `Status: Todo`, `In Progress`, `On Hold`, `In Review`, `Done` |
| Type | `Type: Bug`, `Feature`, `Enhancement`, `Documentation`, `Maintenance` |
| Priority | `Priority: Critical`, `High`, `Medium`, `Low` |
| Community / Resolution | `Good First Issue`, `Help Wanted`, `Resolution: Duplicate`, `Invalid`, `Wontfix` |

## Scripts

All of them need `gh` installed and authenticated (`gh auth login`). On Windows, run them in Git Bash.

| Script | Use it for |
| --- | --- |
| `init-labels.sh <owner/repo>` | One repo |
| `update-all-labels.sh [--since N] [--only-outdated] [--dry-run] [--owner X]` | Many repos. `--only-outdated` skips repos that already match. `--since N` limits it to repos pushed in the last N days |
| `new-repo.sh <Name> [--desc ..] [--topics a,b] [gh repo create flags]` | Creates a repo with the description, topics and labels set in one step (private by default) |
| `lib/labels.sh` | The scheme itself plus shared helpers. Edit labels here and every script picks them up |

**What a run does** (safe to re-run):

- **Renames** the 8 matching defaults (`bug` → `Type: Bug`, `good first issue` → `Good First Issue`, …) with `gh label edit`, so tagged issues keep their label.
- **Deletes** `question`, which has no equivalent in the scheme.
- **Creates or corrects** the other 11 labels with `--force`, so any color or description drift gets fixed.
- **Never touches** labels you created yourself.

## Automatic Sync (GitHub Action)

[`.github/workflows/sync-labels.yml`](../.github/workflows/sync-labels.yml) runs `update-all-labels.sh --since 3 --only-outdated` every day. Any repo you create, whether from the CLI, github.com or a template, gets the scheme within a day without you doing anything. You can also trigger it from the **Actions** tab, and setting `since` to `all` re-checks every repo.

One-time setup:

1. Create a [fine-grained token](https://github.com/settings/personal-access-tokens/new) with **All repositories** access and these repository permissions: **Issues: Read and write**, **Metadata: Read-only**. Set the expiry you want, and renew it when it expires.
2. In this repo, go to **Settings → Secrets and variables → Actions → New repository secret**, name it `LABELS_TOKEN`, and paste the token.
3. Run the workflow once from the **Actions** tab to confirm it works.

To label a new repo right away instead of waiting for the daily run, use `new-repo.sh` or `init-labels.sh`.
