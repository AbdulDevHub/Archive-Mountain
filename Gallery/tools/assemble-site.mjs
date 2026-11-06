#!/usr/bin/env node
/**
 * Builds the publish folder (_site/) after build.sh has built everything.
 *
 * Only what the gallery shows goes live, so the rest of the repo (University,
 * Mobile, backend experiments, cut projects...) is never deployed:
 *   - Gallery/dist/            -> _site/            (the island is the front page)
 *   - each static project      -> _site/<its repo path>/  (the folder holding its href)
 *   - each screenshot          -> _site/<its repo path>
 *   - Effects/Playground/effects.json: every effect folder it lists
 * Framework apps are copied to _site/projects/<slug>/ by build.sh itself.
 *
 * Usage: node Gallery/tools/assemble-site.mjs <repoRoot> <outDir>
 */
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"

const [root, out] = process.argv.slice(2)
if (!root || !out) {
  console.error("Usage: node assemble-site.mjs <repoRoot> <outDir>")
  process.exit(1)
}

const SKIP = new Set(["node_modules", ".git", ".next", ".svelte-kit", ".angular", ".env", ".env.local"])
const copy = (rel) => {
  const from = join(root, rel)
  if (!existsSync(from)) throw new Error(`assemble-site: "${rel}" does not exist (was it built?)`)
  const to = join(out, rel)
  mkdirSync(dirname(to), { recursive: true })
  cpSync(from, to, { recursive: true, filter: (src) => !SKIP.has(src.split(/[\\/]/).pop()) })
}
const isLocal = (href) => !/^https?:\/\//.test(href) && !href.startsWith("/")

rmSync(out, { recursive: true, force: true })
cpSync(join(root, "Gallery/dist"), out, { recursive: true })

const projects = JSON.parse(readFileSync(join(root, "Gallery/projects.json"), "utf8"))
const copied = new Set()
for (const p of projects) {
  if (isLocal(p.href)) {
    const folder = dirname(p.href)
    if (!copied.has(folder)) copy(folder)
    copied.add(folder)
  }
  if (isLocal(p.image)) copy(p.image)
}

const effects = JSON.parse(readFileSync(join(root, "Effects/Playground/effects.json"), "utf8"))
for (const e of effects) if (e.folder) copy(e.folder)

console.log(`assemble-site: ${projects.length} projects and ${effects.length} effects ready in ${out}`)
