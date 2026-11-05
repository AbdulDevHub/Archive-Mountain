#!/usr/bin/env node
/**
 * Moves a built single-page app from the site root to a sub-path, after the build.
 *
 * Many of the moved projects reference public files with root-absolute paths
 * ("/images/x.png", "/_next/static/..."), which only work when the app is served at "/".
 * This rewrites every quoted or url()-wrapped "/<entry>" in the built HTML, JS, CSS and
 * JSON files, where <entry> is a top-level file or folder of the build output, so it
 * points at "<base><entry>" instead.
 *
 * Usage: node tools/relocate.mjs <outDir> </apps/slug/>
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { extname, join } from "node:path"

const [outDir, base] = process.argv.slice(2)
if (!outDir || !base?.startsWith("/") || !base.endsWith("/")) {
  console.error("Usage: node tools/relocate.mjs <outDir> </base/path/>")
  process.exit(1)
}

const TEXT = new Set([".html", ".js", ".mjs", ".css", ".json", ".txt", ".webmanifest", ".svg"])
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const entries = readdirSync(outDir).filter((e) => e !== "index.html")
if (entries.length === 0) process.exit(0)

// "/<entry>" right after a quote, backtick or "url(" — and not already under base
// (an app may have its own top-level folder named like the base, e.g. public/projects/)
const pattern = new RegExp(
  `(["'\`]|url\\(\\s*)/(?!${escape(base.slice(1))})(${entries.map(escape).join("|")})(?=[/"'\`?#)\\s]|$)`,
  "g",
)

let files = 0
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (TEXT.has(extname(name))) {
      const before = readFileSync(path, "utf8")
      const after = before.replace(pattern, (_, lead, entry) => `${lead}${base}${entry}`)
      if (after !== before) {
        writeFileSync(path, after)
        files++
      }
    }
  }
}
walk(outDir)
console.log(`relocate: ${files} files in ${outDir} now point at ${base}`)
